import { encode } from 'fast-png';
import { PNG, PngType } from 'src/utils/png.js';

describe(`PNG`, () => {
  it(`can load images with alpha values greater than 1`, () => {
    // This Uint8Array contains a PNG image composed of a single pixel. It was
    // generated with the following code in a browser:
    // ```
    // const ctx = c.getContext('2d');
    // ctx.fillStyle = 'rgba(255, 120, 80, 0.5)';
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ```
    // The pixel has the following values: R=255, G=120, B=80, A=128
    //
    // prettier-ignore
    const input = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84,
      24, 87, 99, 248, 95, 17, 208, 0, 0, 6, 137, 2, 72, 25, 58, 220, 62, 0, 0,
      0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);

    const pngImage = PNG.load(input);

    expect(pngImage.rgbChannel).toEqual(new Uint8Array([255, 120, 80]));
    expect(pngImage.alphaChannel).toEqual(new Uint8Array([128]));
  });

  describe(`color type detection`, () => {
    it(`detects greyscale PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([32]),
          channels: 1,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.Greyscale);
      expect(pngImage.rgbChannel).toEqual(new Uint8Array([32, 32, 32]));
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`detects truecolour PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([10, 20, 30]),
          channels: 3,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.Truecolour);
      expect(pngImage.rgbChannel).toEqual(new Uint8Array([10, 20, 30]));
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`detects indexed-colour PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([0]),
          channels: 1,
          depth: 8,
          palette: [[100, 110, 120]],
        }),
      );

      expect(pngImage.type).toBe(PngType.IndexedColour);
      expect(pngImage.rgbChannel).toEqual(new Uint8Array([100, 110, 120]));
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`detects greyscale-with-alpha PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([40, 200]),
          channels: 2,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.GreyscaleWithAlpha);
      expect(pngImage.rgbChannel).toEqual(new Uint8Array([40, 40, 40]));
      expect(pngImage.alphaChannel).toEqual(new Uint8Array([200]));
    });

    it(`detects truecolour-with-alpha PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([1, 2, 3, 4]),
          channels: 4,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.TruecolourWithAlpha);
      expect(pngImage.rgbChannel).toEqual(new Uint8Array([1, 2, 3]));
      expect(pngImage.alphaChannel).toEqual(new Uint8Array([4]));
    });
  });

  describe(`alpha channel handling`, () => {
    it(`drops fully opaque alpha channels`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([9, 8, 7, 255]),
          channels: 4,
          depth: 8,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(new Uint8Array([9, 8, 7]));
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`preserves palette alpha for indexed PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([0]),
          channels: 1, // indexed
          depth: 8,
          palette: [[12, 34, 56, 128]],
        }),
      );

      expect(pngImage.type).toBe(PngType.IndexedColour);
      expect(pngImage.rgbChannel).toEqual(new Uint8Array([12, 34, 56]));
      expect(pngImage.alphaChannel).toEqual(new Uint8Array([128]));
    });
  });

  describe(`bit depth normalization`, () => {
    it(`handles 1-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 2,
          data: new Uint8Array([0b10000000, 0b00000000]),
          channels: 1, // greyscale
          depth: 1,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        new Uint8Array([255, 255, 255, 0, 0, 0]),
      );
    });

    it(`handles 2-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([0b11000000]),
          channels: 1, // greyscale
          depth: 2,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(new Uint8Array([255, 255, 255]));
    });

    it(`handles 4-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([0b11110000]),
          channels: 1, // greyscale
          depth: 4,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(new Uint8Array([255, 255, 255]));
    });

    it(`handles 8-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint8Array([12, 34, 56]),
          channels: 3, // RGB
          depth: 8,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(new Uint8Array([12, 34, 56]));
    });

    it(`handles 16-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 1,
          height: 1,
          data: new Uint16Array([0xffff, 0x8000, 0x0000]),
          channels: 3, // RGB
          depth: 16,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(new Uint8Array([255, 128, 0]));
    });
  });
});
