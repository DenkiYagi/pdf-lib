import { decode } from 'fast-png';
import { toRgba8 } from 'src/utils/fast-png-helper.js';
import { InvalidPngError } from 'src/utils/errors.js';

const mapPngError = (error: unknown, msgPrefix: string): InvalidPngError => {
  const message =
    error instanceof InvalidPngError
      ? error.message
      : error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
  return new InvalidPngError(`${msgPrefix} ${message}`);
};

const getImageType = (
  channels: number,
  palette?: unknown[][],
): PngType => {
  if (palette) return PngType.IndexedColour;
  if (channels === 1) return PngType.Greyscale;
  if (channels === 2) return PngType.GreyscaleWithAlpha;
  if (channels === 3) return PngType.Truecolour;
  if (channels === 4) return PngType.TruecolourWithAlpha;
  throw new InvalidPngError(`Unknown channel count: ${channels}`);
};

const splitAlphaChannel = (rgbaChannel: Uint8Array) => {
  const pixelCount = Math.floor(rgbaChannel.length / 4);

  const rgbChannel = new Uint8Array(pixelCount * 3);
  const alphaChannel = new Uint8Array(pixelCount * 1);

  let rgbaOffset = 0;
  let rgbOffset = 0;
  let alphaOffset = 0;

  while (rgbaOffset < rgbaChannel.length) {
    rgbChannel[rgbOffset++] = rgbaChannel[rgbaOffset++];
    rgbChannel[rgbOffset++] = rgbaChannel[rgbaOffset++];
    rgbChannel[rgbOffset++] = rgbaChannel[rgbaOffset++];
    alphaChannel[alphaOffset++] = rgbaChannel[rgbaOffset++];
  }

  return { rgbChannel, alphaChannel };
};

export enum PngType {
  Greyscale = 'Greyscale',
  Truecolour = 'Truecolour',
  IndexedColour = 'IndexedColour',
  GreyscaleWithAlpha = 'GreyscaleWithAlpha',
  TruecolourWithAlpha = 'TruecolourWithAlpha',
}

export class PNG {
  static load = (pngData: Uint8Array) => new PNG(pngData);

  readonly rgbChannel: Uint8Array;
  readonly alphaChannel?: Uint8Array;
  readonly type: PngType;
  readonly width: number;
  readonly height: number;
  readonly bitsPerComponent: number;

  private constructor(pngData: Uint8Array) {
    let decoded: ReturnType<typeof decode>;
    try {
      decoded = decode(pngData);
    } catch (error) {
      throw mapPngError(error, 'Failed to decode PNG:');
    }

    let rgbaBuffer: Uint8Array;
    try {
      rgbaBuffer = toRgba8(decoded);
    } catch (error) {
      throw mapPngError(error, 'Failed to convert PNG to RGBA8:');
    }

    const { rgbChannel, alphaChannel } = splitAlphaChannel(rgbaBuffer);

    this.rgbChannel = rgbChannel;

    const hasAlphaValues = alphaChannel.some((a) => a < 255);
    if (hasAlphaValues) this.alphaChannel = alphaChannel;

    this.type = getImageType(decoded.channels, decoded.palette);

    this.width = decoded.width;
    this.height = decoded.height;
    this.bitsPerComponent = 8;
  }
}
