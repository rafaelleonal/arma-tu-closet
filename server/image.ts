import { MAX_IMAGE_BYTES } from '../src/ai/contracts';
import type { AnalysisImage } from './analysis';

export class RequestError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export const MAX_BODY_BYTES = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 256;

export function parseImageRequest(value: unknown): AnalysisImage {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== 1 || !('imageDataUrl' in value) || typeof value.imageDataUrl !== 'string') {
    throw new RequestError(400, 'Envía una foto en imageDataUrl.');
  }
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value.imageDataUrl);
  if (!match) throw new RequestError(400, 'Elige una foto JPEG, PNG o WebP en formato base64.');
  const [, mediaType, encoded] = match;
  if (encoded.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) throw new RequestError(413, 'La foto supera 4 MB. Elige una más pequeña.');
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length || bytes.toString('base64') !== encoded) throw new RequestError(400, 'La foto no tiene un formato base64 válido.');
  if (bytes.length > MAX_IMAGE_BYTES) throw new RequestError(413, 'La foto supera 4 MB. Elige una más pequeña.');
  const jpeg = bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9;
  const png = bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.toString('ascii', 12, 16) === 'IHDR';
  const webp = bytes.length >= 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' && bytes.readUInt32LE(4) === bytes.length - 8;
  if (!(mediaType === 'image/jpeg' && jpeg || mediaType === 'image/png' && png || mediaType === 'image/webp' && webp)) {
    throw new RequestError(400, 'El contenido de la foto no coincide con su formato. Elige otra imagen.');
  }
  return { bytes, mediaType: mediaType as AnalysisImage['mediaType'] };
}
