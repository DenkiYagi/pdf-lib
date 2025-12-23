import UPNG from '@pdf-lib/upng';
import {
  AnimatedPngNotSupportedError,
  InvalidPngError,
} from 'src/utils/errors.js';

const mapUpngError = (error: unknown, msgPrefix: string): InvalidPngError => {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return new InvalidPngError(`${msgPrefix} ${message}`);
};

const getImageType = (ctype: number) => {
  if (ctype === 0) return PngType.Greyscale;
  if (ctype === 2) return PngType.Truecolour;
  if (ctype === 3) return PngType.IndexedColour;
  if (ctype === 4) return PngType.GreyscaleWithAlpha;
  if (ctype === 6) return PngType.TruecolourWithAlpha;
  throw new InvalidPngError(`Unknown color type: ${ctype}`);
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
    let upng: ReturnType<typeof UPNG.decode>;
    try {
      // @ts-ignore : It internally does new Uint8Array()
      upng = UPNG.decode(pngData);
    } catch (error) {
      throw mapUpngError(error, 'Failed to decode PNG:');
    }

    let frames: ArrayBuffer[];
    try {
      frames = UPNG.toRGBA8(upng);
    } catch (error) {
      throw mapUpngError(error, 'Failed to convert PNG to RGBA8:');
    }

    if (frames.length > 1) {
      throw new AnimatedPngNotSupportedError();
    }

    const frame = new Uint8Array(frames[0]);
    const { rgbChannel, alphaChannel } = splitAlphaChannel(frame);

    this.rgbChannel = rgbChannel;

    const hasAlphaValues = alphaChannel.some((a) => a < 255);
    if (hasAlphaValues) this.alphaChannel = alphaChannel;

    this.type = getImageType(upng.ctype);

    this.width = upng.width;
    this.height = upng.height;
    this.bitsPerComponent = 8;
  }
}
