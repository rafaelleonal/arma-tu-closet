"""Genera los stickers de las ilustraciones de prendas (assets/garments/stickers).

Cada sticker es el dibujo sin carita sobre una silueta blanca con borde troquelado.
Los dibujos originales de assets/garments no se modifican.

Uso:
    uv run --with pillow --with numpy --with scipy scripts/garment-stickers.py
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "garments"
OUT = SRC / "stickers"
KINDS = [
    "tee", "shirt", "sweater", "trousers", "dress",
    "sneakers", "boots", "jacket", "scarf",
]  # fmt: skip
SIZE = 640
BORDER = 22  # px en el original de 1254; unos 11 px en la salida
PAPER = (251, 250, 246)


def round_blobs(labels):
    """Componentes pequeños, casi cuadrados y rellenos: los ojos."""
    blobs = []
    for index, (ys, xs) in enumerate(ndi.find_objects(labels), start=1):
        height, width = ys.stop - ys.start, xs.stop - xs.start
        area = int((labels[ys, xs] == index).sum())
        if (
            20 <= width <= 62
            and 20 <= height <= 62
            and abs(width - height) <= 12
            and area / (width * height) >= 0.5
        ):
            blobs.append((index, (xs.start + xs.stop) / 2, (ys.start + ys.stop) / 2))
    return blobs


def face_components(alpha):
    """Dos ojos a la misma altura y la sonrisa debajo, entre ellos."""
    labels, _ = ndi.label(alpha > 40, structure=np.ones((3, 3)))
    blobs = round_blobs(labels)
    pairs = [
        (a, b)
        for i, a in enumerate(blobs)
        for b in blobs[i + 1 :]
        if 60 <= abs(a[1] - b[1]) <= 420 and abs(a[2] - b[2]) <= 110
    ]
    for a, b in pairs:
        left, right = sorted((a[1], b[1]))
        eye_y = (a[2] + b[2]) / 2
        for index, (ys, xs) in enumerate(ndi.find_objects(labels), start=1):
            if index in (a[0], b[0]):
                continue
            center_x, center_y = (xs.start + xs.stop) / 2, (ys.start + ys.stop) / 2
            area = int((labels[ys, xs] == index).sum())
            if (
                left - 40 <= center_x <= right + 40
                and eye_y <= center_y <= eye_y + 150
                and 500 <= area <= 9000
                and xs.stop - xs.start <= (right - left) + 140
            ):
                return labels, [a[0], b[0], index]
    raise SystemExit("No se encontró la carita")


def sticker(path):
    arr = np.array(Image.open(path).convert("RGBA"))
    labels, face = face_components(arr[..., 3])
    arr[ndi.binary_dilation(np.isin(labels, face), iterations=3), 3] = 0
    alpha = arr[..., 3].astype(float) / 255
    alpha[alpha < 0.08] = 0  # los originales traen ruido casi transparente
    solid = alpha > 0.2
    closed = ndi.binary_closing(np.pad(solid, 20), iterations=4)[20:-20, 20:-20]
    body = ndi.binary_fill_holes(closed)
    distance = ndi.distance_transform_edt(~body)
    paper = np.clip(BORDER + 0.5 - distance, 0, 1)
    out_alpha = alpha + paper * (1 - alpha)
    color = (
        arr[..., :3] * alpha[..., None]
        + np.array(PAPER)[None, None] * (paper * (1 - alpha))[..., None]
    ) / np.maximum(out_alpha, 1e-6)[..., None]
    out = np.dstack([color, out_alpha * 255]).clip(0, 255).astype(np.uint8)
    image = Image.fromarray(out, "RGBA")
    return image.crop(image.getchannel("A").point(lambda value: 255 * (value > 8)).getbbox())


def main():
    OUT.mkdir(exist_ok=True)
    for kind in KINDS:
        image = sticker(SRC / f"{kind}.png")
        image.thumbnail((SIZE, SIZE), Image.LANCZOS)
        image.save(OUT / f"{kind}.png", optimize=True)
        print(kind, image.size)


if __name__ == "__main__":
    main()
