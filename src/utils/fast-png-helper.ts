import { convertIndexedToRgb, type DecodedPng } from 'fast-png';
import { InvalidPngError } from 'src/utils/errors.js';

const toByte = (value: number, depth: number) => {
  if (depth === 8) return value;
  if (depth === 16) return Math.round(value / 257);
  const maxValue = (1 << depth) - 1;
  return Math.round((value * 255) / maxValue);
};

const unpackSamples = (image: DecodedPng): Uint8Array | Uint16Array => {
  const { data, depth, width, height, channels } = image;
  if (depth === 16) {
    if (data instanceof Uint16Array) return data;
    return new Uint16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  }

  if (depth === 8) {
    if (data instanceof Uint8Array) return data;
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  const raw =
    data instanceof Uint8Array
      ? data
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const pixelCount = width * height;
  const samplesPerPixel = channels;
  const samplesPerRow = width * samplesPerPixel;
  const samples = new Uint8Array(pixelCount * samplesPerPixel);
  const mask = (1 << depth) - 1;

  let dataIndex = 0;
  let sampleIndex = 0;

  for (let row = 0; row < height; row++) {
    let bitsRemaining = 0;
    let currentByte = 0;

    for (let sample = 0; sample < samplesPerRow; sample++) {
      if (bitsRemaining < depth) {
        currentByte = raw[dataIndex++];
        bitsRemaining = 8;
      }

      bitsRemaining -= depth;
      samples[sampleIndex++] = (currentByte >> bitsRemaining) & mask;
    }

    bitsRemaining = 0;
  }

  return samples;
};

const expandIndexedToRgba = (image: DecodedPng) => {
  if (!image.palette || image.palette.length === 0) {
    throw new InvalidPngError('Indexed PNG is missing a color palette');
  }

  const paletteChannels = image.palette[0].length;
  if (paletteChannels !== 3 && paletteChannels !== 4) {
    throw new InvalidPngError(
      `Unsupported palette channel count: ${paletteChannels}`,
    );
  }

  const paletteData = convertIndexedToRgb(image);
  const pixelCount = image.width * image.height;
  const rgba = new Uint8Array(pixelCount * 4);

  for (let i = 0; i < pixelCount; i++) {
    const paletteOffset = i * paletteChannels;
    const rgbaOffset = i * 4;

    rgba[rgbaOffset] = paletteData[paletteOffset];
    rgba[rgbaOffset + 1] = paletteData[paletteOffset + 1];
    rgba[rgbaOffset + 2] = paletteData[paletteOffset + 2];
    rgba[rgbaOffset + 3] =
      paletteChannels === 4 ? paletteData[paletteOffset + 3] : 255;
  }

  return rgba;
};

export const toRgba8 = (image: DecodedPng): Uint8Array<ArrayBuffer> => {
  if (image.palette) return expandIndexedToRgba(image);

  const samples = unpackSamples(image);
  const { channels, depth, width, height, transparency } = image;
  const pixelCount = width * height;

  const expectedSamples = pixelCount * channels;
  if (samples.length < expectedSamples) {
    throw new InvalidPngError(
      `PNG data is truncated (expected at least ${expectedSamples} samples, got ${samples.length})`,
    );
  }

  const rgba = new Uint8Array(pixelCount * 4);

  switch (channels) {
    case 4: {
      for (let i = 0; i < pixelCount; i++) {
        const sampleOffset = i * 4;
        const rgbaOffset = i * 4;

        rgba[rgbaOffset] = toByte(samples[sampleOffset], depth);
        rgba[rgbaOffset + 1] = toByte(samples[sampleOffset + 1], depth);
        rgba[rgbaOffset + 2] = toByte(samples[sampleOffset + 2], depth);
        rgba[rgbaOffset + 3] = toByte(samples[sampleOffset + 3], depth);
      }
      break;
    }

    case 3: {
      const transparentColor =
        transparency && transparency.length >= 3
          ? [
              toByte(transparency[0], depth),
              toByte(transparency[1], depth),
              toByte(transparency[2], depth),
            ]
          : undefined;

      for (let i = 0; i < pixelCount; i++) {
        const sampleOffset = i * 3;
        const rgbaOffset = i * 4;

        const r = toByte(samples[sampleOffset], depth);
        const g = toByte(samples[sampleOffset + 1], depth);
        const b = toByte(samples[sampleOffset + 2], depth);

        rgba[rgbaOffset] = r;
        rgba[rgbaOffset + 1] = g;
        rgba[rgbaOffset + 2] = b;
        rgba[rgbaOffset + 3] =
          transparentColor &&
          r === transparentColor[0] &&
          g === transparentColor[1] &&
          b === transparentColor[2]
            ? 0
            : 255;
      }
      break;
    }

    case 2: {
      for (let i = 0; i < pixelCount; i++) {
        const sampleOffset = i * 2;
        const rgbaOffset = i * 4;

        const gray = toByte(samples[sampleOffset], depth);
        const alpha = toByte(samples[sampleOffset + 1], depth);

        rgba[rgbaOffset] = gray;
        rgba[rgbaOffset + 1] = gray;
        rgba[rgbaOffset + 2] = gray;
        rgba[rgbaOffset + 3] = alpha;
      }
      break;
    }

    case 1: {
      const transparentSample =
        transparency && transparency.length > 0
          ? toByte(transparency[0], depth)
          : undefined;

      for (let i = 0; i < pixelCount; i++) {
        const rgbaOffset = i * 4;
        const gray = toByte(samples[i], depth);

        rgba[rgbaOffset] = gray;
        rgba[rgbaOffset + 1] = gray;
        rgba[rgbaOffset + 2] = gray;
        rgba[rgbaOffset + 3] =
          transparentSample !== undefined && gray === transparentSample
            ? 0
            : 255;
      }
      break;
    }

    default:
      throw new InvalidPngError(`Unknown channel count: ${channels}`);
  }

  return rgba;
};
