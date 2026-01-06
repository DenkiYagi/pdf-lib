import { encode } from 'fast-png';
import { PNG, PngType } from 'src/utils/png.js';

describe(`PNG`, () => {
  it(`can load images with alpha values greater than 1`, () => {
    const pngImage = PNG.load(
      encode({
        width: 2,
        height: 2,
        // prettier-ignore
        data: new Uint8Array([
          255, 120, 80, 128, // pixel 1
          10, 20, 30, 200, // pixel 2
          5, 15, 25, 64, // pixel 3
          250, 240, 230, 5, // pixel 4
        ]),
        channels: 4,
        depth: 8,
      }),
    );

    expect(pngImage.rgbChannel).toEqual(
      // prettier-ignore
      new Uint8Array([
        255, 120, 80, // pixel 1
        10, 20, 30, // pixel 2
        5, 15, 25, // pixel 3
        250, 240, 230, // pixel 4
      ]),
    );
    expect(pngImage.alphaChannel).toEqual(
      // prettier-ignore
      new Uint8Array([
        128, // pixel 1
        200, // pixel 2
        64, // pixel 3
        5, // pixel 4
      ]),
    );
  });

  describe(`color type detection`, () => {
    it(`detects greyscale PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            32, // pixel 1
            64, // pixel 2
            96, // pixel 3
            128, // pixel 4
          ]),
          channels: 1,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.Greyscale);
      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          32, 32, 32, // pixel 1
          64, 64, 64, // pixel 2
          96, 96, 96, // pixel 3
          128, 128, 128, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`detects truecolour PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            10, 20, 30, // pixel 1
            40, 50, 60, // pixel 2
            70, 80, 90, // pixel 3
            100, 110, 120, // pixel 4
          ]),
          channels: 3,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.Truecolour);
      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          10, 20, 30, // pixel 1
          40, 50, 60, // pixel 2
          70, 80, 90, // pixel 3
          100, 110, 120, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`detects indexed-colour PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            0, // pixel 1
            1, // pixel 2
            1, // pixel 3
            0, // pixel 4
          ]),
          channels: 1,
          depth: 8,
          palette: [
            [100, 110, 120],
            [10, 20, 30],
          ],
        }),
      );

      expect(pngImage.type).toBe(PngType.IndexedColour);
      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          100, 110, 120, // pixel 1
          10, 20, 30, // pixel 2
          10, 20, 30, // pixel 3
          100, 110, 120, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`detects greyscale-with-alpha PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            40, 200, // pixel 1
            50, 255, // pixel 2
            60, 128, // pixel 3
            70, 0, // pixel 4
          ]),
          channels: 2,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.GreyscaleWithAlpha);
      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          40, 40, 40, // pixel 1
          50, 50, 50, // pixel 2
          60, 60, 60, // pixel 3
          70, 70, 70, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          200, // pixel 1
          255, // pixel 2
          128, // pixel 3
          0, // pixel 4
        ]),
      );
    });

    it(`detects truecolour-with-alpha PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            1, 2, 3, 4, // pixel 1
            5, 6, 7, 255, // pixel 2
            8, 9, 10, 0, // pixel 3
            11, 12, 13, 128, // pixel 4
          ]),
          channels: 4,
          depth: 8,
        }),
      );

      expect(pngImage.type).toBe(PngType.TruecolourWithAlpha);
      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          1, 2, 3, // pixel 1
          5, 6, 7, // pixel 2
          8, 9, 10, // pixel 3
          11, 12, 13, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          4, // pixel 1
          255, // pixel 2
          0, // pixel 3
          128, // pixel 4
        ]),
      );
    });
  });

  describe(`alpha channel handling`, () => {
    it(`drops fully opaque alpha channels`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            9, 8, 7, 255, // pixel 1
            1, 2, 3, 255, // pixel 2
            4, 5, 6, 255, // pixel 3
            7, 8, 9, 255, // pixel 4
          ]),
          channels: 4,
          depth: 8,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          9, 8, 7, // pixel 1
          1, 2, 3, // pixel 2
          4, 5, 6, // pixel 3
          7, 8, 9, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toBeUndefined();
    });

    it(`preserves palette alpha for indexed PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            0, // pixel 1
            1, // pixel 2
            1, // pixel 3
            0, // pixel 4
          ]),
          channels: 1, // indexed
          depth: 8,
          palette: [
            [12, 34, 56, 128],
            [98, 76, 54, 255],
          ],
        }),
      );

      expect(pngImage.type).toBe(PngType.IndexedColour);
      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          12, 34, 56, // pixel 1
          98, 76, 54, // pixel 2
          98, 76, 54, // pixel 3
          12, 34, 56, // pixel 4
        ]),
      );
      expect(pngImage.alphaChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          128, // pixel 1
          255, // pixel 2
          255, // pixel 3
          128, // pixel 4
        ]),
      );
    });
  });

  describe(`bit depth normalization`, () => {
    it(`handles 1-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            0b10000000, // row 1: pixel 1=1, pixel 2=0
            0b01000000, // row 2: pixel 3=0, pixel 4=1
          ]),
          channels: 1, // greyscale
          depth: 1,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          255, 255, 255, // pixel 1
          0, 0, 0, // pixel 2
          0, 0, 0, // pixel 3
          255, 255, 255, // pixel 4
        ]),
      );
    });

    it(`handles 2-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            0b11000000, // row 1: pixel 1=3, pixel 2=0
            0b01100000, // row 2: pixel 3=1, pixel 4=2
          ]),
          channels: 1, // greyscale
          depth: 2,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          255, 255, 255, // pixel 1 (3/3)
          0, 0, 0, // pixel 2 (0/3)
          85, 85, 85, // pixel 3 (1/3)
          170, 170, 170, // pixel 4 (2/3)
        ]),
      );
    });

    it(`handles 4-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            0b11110000, // row 1: pixel 1=15, pixel 2=0
            0b10000100, // row 2: pixel 3=8, pixel 4=4
          ]),
          channels: 1, // greyscale
          depth: 4,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          255, 255, 255, // pixel 1
          0, 0, 0, // pixel 2
          136, 136, 136, // pixel 3
          68, 68, 68, // pixel 4
        ]),
      );
    });

    it(`handles 8-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint8Array([
            12, 34, 56, // pixel 1
            78, 90, 12, // pixel 2
            34, 56, 78, // pixel 3
            90, 12, 34, // pixel 4
          ]),
          channels: 3, // RGB
          depth: 8,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          12, 34, 56, // pixel 1
          78, 90, 12, // pixel 2
          34, 56, 78, // pixel 3
          90, 12, 34, // pixel 4
        ]),
      );
    });

    it(`handles 16-bit PNGs`, () => {
      const pngImage = PNG.load(
        encode({
          width: 2,
          height: 2,
          // prettier-ignore
          data: new Uint16Array([
            0xffff, 0x8000, 0x0000, // pixel 1
            0x0000, 0xffff, 0x8000, // pixel 2
            0x8000, 0x0000, 0xffff, // pixel 3
            0x4000, 0xc000, 0x2000, // pixel 4
          ]),
          channels: 3, // RGB
          depth: 16,
        }),
      );

      expect(pngImage.rgbChannel).toEqual(
        // prettier-ignore
        new Uint8Array([
          255, 128, 0, // pixel 1
          0, 255, 128, // pixel 2
          128, 0, 255, // pixel 3
          64, 191, 32, // pixel 4
        ]),
      );
    });
  });
});
