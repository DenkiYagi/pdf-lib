import type { LayoutAdvancedParams } from '@denkiyagi/fontkit';
import type { TTFFont, Glyph } from '@denkiyagi/fontkit';

import { createCmap } from 'src/core/embedders/CMap.js';
import { deriveFontFlags } from 'src/core/embedders/FontFlags.js';
import { PDFHexString } from 'src/core/objects/PDFHexString.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';
import { PDFString } from 'src/core/objects/PDFString.js';
import type { PDFContext } from 'src/core/PDFContext.js';
import { Cache } from 'src/utils/Cache.js';
import { byAscendingId, sortedUniq } from 'src/utils/arrays.js';
import { toHexStringOfMinLength } from 'src/utils/strings.js';
import type { EmbedFontAdvancedOptions } from 'src/api/PDFDocumentOptions.js';
import type { SingleLineTextOrGlyphs } from 'src/types/text.js';

const emptyObject = {};

/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
export abstract class AbstractCustomFontEmbedder {
  readonly font: TTFFont;
  readonly scale: number;
  readonly fontName: string;
  readonly customName: string | undefined;
  readonly vertical: boolean | undefined;
  readonly fontFeatures: Record<string, boolean> | undefined;
  readonly layoutAdvancedParams: LayoutAdvancedParams;

  protected baseFontName: string;
  protected glyphCache: Cache<Glyph[]>;

  protected constructor(
    font: TTFFont,
    customName?: string,
    vertical?: boolean,
    advanced: EmbedFontAdvancedOptions = emptyObject,
  ) {
    this.font = font;
    this.scale = 1000 / this.font.unitsPerEm;
    this.fontName = this.font.postscriptName || 'Font';
    this.customName = customName;
    this.vertical = vertical;
    this.fontFeatures = advanced.fontFeatures;
    this.layoutAdvancedParams = {
      script: advanced.script,
      language: advanced.language,
      direction: advanced.direction,
      shaper: advanced.shaper,
      skipPerGlyphPositioning: true,
    };

    this.baseFontName = '';
    this.glyphCache = Cache.populatedBy(this.allGlyphsInFontSortedById);
  }

  /**
   * Encode the JavaScript string into this font. (JavaScript encodes strings in
   * Unicode, but embedded fonts use their own custom encodings)
   *
   * @param layoutAdvancedParams Specify this to pass it to `fontkit` instead of the one that `this` embedder itself has.
   */
  encodeText(
    text: SingleLineTextOrGlyphs,
    layoutAdvancedParams?: LayoutAdvancedParams,
  ): PDFHexString {
    let hexCodes: string[];
    if (typeof text === 'string') {
      const { glyphs } = this.font.layout(
        text,
        this.fontFeatures,
        layoutAdvancedParams ?? this.layoutAdvancedParams,
      );
      hexCodes = new Array(glyphs.length);
      for (let idx = 0, len = glyphs.length; idx < len; idx++) {
        hexCodes[idx] = toHexStringOfMinLength(glyphs[idx].id, 4);
      }
    } else {
      const glyphIds = text;
      hexCodes = new Array(glyphIds.length);
      for (let idx = 0, len = glyphIds.length; idx < len; idx++) {
        hexCodes[idx] = toHexStringOfMinLength(glyphIds[idx], 4);
      }
    }

    return PDFHexString.of(hexCodes.join(''));
  }

  // The advanceWidth takes into account kerning automatically, so we don't
  // have to do that manually like we do for the standard fonts.
  widthOfTextAtSize(text: string, size: number): number {
    const { glyphs } = this.font.layout(
      text,
      this.fontFeatures,
      this.layoutAdvancedParams,
    );
    let totalWidth = 0;
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      totalWidth += glyphs[idx].advanceWidth * this.scale;
    }
    const scale = size / 1000;
    return totalWidth * scale;
  }

  heightOfFontAtSize(
    size: number,
    options: { descender?: boolean } = {},
  ): number {
    const { descender = true } = options;

    const { ascent, descent, bbox } = this.font;
    const yTop = (ascent || bbox.maxY) * this.scale;
    const yBottom = (descent || bbox.minY) * this.scale;

    let height = yTop - yBottom;
    if (!descender) height -= Math.abs(descent) || 0;

    return (height / 1000) * size;
  }

  sizeOfFontAtHeight(height: number): number {
    const { ascent, descent, bbox } = this.font;
    const yTop = (ascent || bbox.maxY) * this.scale;
    const yBottom = (descent || bbox.minY) * this.scale;
    return (1000 * height) / (yTop - yBottom);
  }

  embedIntoContext(context: PDFContext, ref?: PDFRef): PDFRef {
    this.baseFontName =
      this.customName || context.addRandomSuffix(this.fontName);
    return this.embedFontDict(context, ref);
  }

  protected embedFontDict(context: PDFContext, ref?: PDFRef): PDFRef {
    const cidFontDictRef = this.embedCIDFontDict(context);
    const unicodeCMapRef = this.embedUnicodeCmap(context);

    const fontDict = context.obj({
      Type: 'Font',
      Subtype: 'Type0',
      BaseFont: this.baseFontName,
      Encoding: this.vertical ? 'Identity-V' : 'Identity-H',
      DescendantFonts: [cidFontDictRef],
      ToUnicode: unicodeCMapRef,
    });

    if (ref) {
      context.assign(ref, fontDict);
      return ref;
    } else {
      return context.register(fontDict);
    }
  }

  protected isCFF(): boolean {
    return this.font.cff;
  }

  protected embedCIDFontDict(context: PDFContext): PDFRef {
    const fontDescriptorRef = this.embedFontDescriptor(context);

    const cidFontDict = context.obj({
      Type: 'Font',
      Subtype: this.isCFF() ? 'CIDFontType0' : 'CIDFontType2',
      CIDToGIDMap: 'Identity',
      BaseFont: this.baseFontName,
      CIDSystemInfo: {
        Registry: PDFString.of('Adobe'),
        Ordering: PDFString.of('Identity'),
        Supplement: 0,
      },
      FontDescriptor: fontDescriptorRef,
      W: this.vertical ? undefined : this.computeW(),
      W2: this.vertical ? this.computeW2() : undefined,
    });

    return context.register(cidFontDict);
  }

  protected embedFontDescriptor(context: PDFContext): PDFRef {
    const fontStreamRef = this.embedFontStream(context);

    const { scale } = this;
    const { italicAngle, ascent, descent, capHeight, xHeight } = this.font;
    const { minX, minY, maxX, maxY } = this.font.bbox;

    const fontDescriptor = context.obj({
      Type: 'FontDescriptor',
      FontName: this.baseFontName,
      Flags: deriveFontFlags(this.font),
      FontBBox: [minX * scale, minY * scale, maxX * scale, maxY * scale],
      ItalicAngle: italicAngle,
      Ascent: ascent * scale,
      Descent: descent * scale,
      CapHeight: (capHeight || ascent) * scale,
      XHeight: (xHeight || 0) * scale,

      // Not sure how to compute/find this, nor is anybody else really:
      // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
      StemV: 0,

      [this.isCFF() ? 'FontFile3' : 'FontFile2']: fontStreamRef,
    });

    return context.register(fontDescriptor);
  }

  protected abstract serializeFont(): Uint8Array;

  protected embedFontStream(context: PDFContext): PDFRef {
    const fontStream = context.flateStream(this.serializeFont(), {
      Subtype: this.isCFF() ? 'CIDFontType0C' : undefined,
    });
    return context.register(fontStream);
  }

  protected embedUnicodeCmap(context: PDFContext): PDFRef {
    const cmap = createCmap(this.glyphCache.access(), this.glyphId.bind(this));
    const cmapStream = context.flateStream(cmap);
    return context.register(cmapStream);
  }

  protected glyphId(glyph?: Glyph): number {
    return glyph ? glyph.id : -1;
  }

  /**
   * @see {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf} "9.7.4.3 Glyph Metrics in CIDFonts"
   * @returns Array to be assigned to the `W` entry in the CIDFont dictionary
   */
  protected computeW(): (number | number[])[] {
    const glyphs = this.glyphCache.access();
    const { scale } = this;

    const W: (number | number[])[] = [];
    let currSection: number[] = [];

    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const currGlyph = glyphs[idx];
      const prevGlyph = glyphs[idx - 1];

      const currGlyphId = this.glyphId(currGlyph);
      const prevGlyphId = this.glyphId(prevGlyph);

      if (idx === 0) {
        W.push(currGlyphId);
      } else if (currGlyphId - prevGlyphId !== 1) {
        W.push(currSection);
        W.push(currGlyphId);
        currSection = [];
      }

      currSection.push(currGlyph.advanceWidth * scale);
    }

    W.push(currSection);

    return W;
  }

  /**
   * @see {@link https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf} "9.7.4.3 Glyph Metrics in CIDFonts"
   * @returns Array to be assigned to the `W2` entry in the CIDFont dictionary
   */
  protected computeW2(): (number | number[])[] {
    const glyphs = this.glyphCache.access();
    const { scale } = this;
    let defaultVertOriginY = this.font.defaultVertOriginY;
    defaultVertOriginY =
      defaultVertOriginY != null ? defaultVertOriginY * scale : 880;

    const W2: (number | number[])[] = [];
    let currSection: number[] = [];

    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const currGlyph = glyphs[idx];
      const prevGlyph = glyphs[idx - 1];

      const currGlyphId = this.glyphId(currGlyph);
      const prevGlyphId = this.glyphId(prevGlyph);

      if (idx === 0) {
        W2.push(currGlyphId);
      } else if (currGlyphId - prevGlyphId !== 1) {
        W2.push(currSection);
        W2.push(currGlyphId);
        currSection = [];
      }

      const vertOriginY = currGlyph.vertOriginY;
      currSection.push(
        -currGlyph.advanceHeight * scale,
        (currGlyph.advanceWidth * scale) / 2,
        vertOriginY != null ? vertOriginY * scale : defaultVertOriginY,
      );
    }

    W2.push(currSection);

    return W2;
  }

  private allGlyphsInFontSortedById = (): Glyph[] => {
    const glyphs: Glyph[] = new Array(this.font.characterSet.length);
    for (let idx = 0, len = glyphs.length; idx < len; idx++) {
      const codePoint = this.font.characterSet[idx];
      glyphs[idx] = this.font.glyphForCodePoint(codePoint);
    }
    return sortedUniq(glyphs.sort(byAscendingId), (g) => g.id);
  };
}
