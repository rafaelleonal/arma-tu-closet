# Ilustraciones de prendas

Familia de nueve dibujos originales generados con la herramienta integrada `image_gen` de OpenAI. Las dos referencias de Café Sinónimo aportadas por el usuario definen la dirección: contorno grueso y ligeramente irregular, una tinta, espacios abiertos y caras pequeñas. No se reproducen marcas, textos ni composiciones de las referencias.

| Archivo | Prenda |
|---|---|
| `tee.png` | Playera, referencia de estilo para la familia |
| `shirt.png` | Camisa |
| `sweater.png` | Suéter |
| `trousers.png` | Pantalón |
| `dress.png` | Vestido |
| `sneakers.png` | Tenis |
| `boots.png` | Botín |
| `jacket.png` | Chaqueta |
| `scarf.png` | Bufanda |

Los PNG conservan el fondo y los interiores transparentes. La app cambia la tinta según el tema; muestra los colores declarados de la prenda en muestras separadas. Las fotos del usuario se muestran sin tintar.

Son ilustraciones genéricas, no reconstrucciones de prendas reales. El componente selecciona una variante por categoría y algunas palabras del nombre; las categorías todavía no contemplan cada tipo de calzado, accesorio o prenda completa.

Los prompts completos, sus referencias y los archivos de salida están en [prompts.json](prompts.json). No se editaron los píxeles tras generarlos.

## Stickers

`stickers/` contiene una versión de cada dibujo para la pantalla Hoy: sin carita, sobre una silueta clara (`#FBFAF6`) con borde troquelado y recortada a su contorno, a 640 px en su lado mayor. Conservan la tinta original y no se tiñen con el tema.

Se generan a partir de los nueve PNG de esta carpeta, sin tocarlos:

```bash
uv run --with pillow --with numpy --with scipy scripts/garment-stickers.py
```

El script localiza la carita (dos ojos y la sonrisa debajo), la borra, rellena el interior del contorno y añade el borde. Si agregas o regeneras un dibujo, vuelve a ejecutarlo y revisa el resultado a la vista: la detección depende de que la carita sean trazos sueltos.
