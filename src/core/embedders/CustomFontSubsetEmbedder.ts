import { create as createFont, LayoutAdvancedParams } from '@denkiyagi/fontkit';
import type { TTFFont, Glyph, Subset } from '@denkiyagi/fontkit';

import { AbstractCustomFontEmbedder } from './AbstractCustomFontEmbedder.js';
import { InvalidFontTypeError } from '../errors.js';
import { PDFLibErrorTypes } from '../error-base.js';
import { PDFHexString } from '../objects/PDFHexString.js';
import { Cache } from '../../utils/Cache.js';
import { toHexStringOfMinLength } from '../../utils/strings.js';
import type { EmbedFontAdvancedOptions } from '../../api/PDFDocumentOptions.js';
import type { SingleLineTextOrGlyphs } from '../../types/text.js';

/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
export class CustomFontSubsetEmbedder extends AbstractCustomFontEmbedder {
  static for(
    fontData: Uint8Array,
    customFontName?: string,
    vertical?: boolean,
    advanced?: EmbedFontAdvancedOptions,
  ) {
    const font = createFont(fontData);
    if (font.type !== 'TTF') throw new InvalidFontTypeError(font.type);

    return new CustomFontSubsetEmbedder(
      font,
      customFontName,
      vertical,
      advanced,
    );
  }

  static forTTFFont(
    font: TTFFont,
    customFontName?: string,
    vertical?: boolean,
    advanced?: EmbedFontAdvancedOptions,
  ) {
    if (font.type !== 'TTF') {
      throw new InvalidFontTypeError(
        font.type,
        PDFLibErrorTypes.INVALID_CALLER_INPUT,
      );
    }

    return new CustomFontSubsetEmbedder(
      font,
      customFontName,
      vertical,
      advanced,
    );
  }

  private readonly subset: Subset;
  private readonly glyphs: Glyph[];
  private readonly glyphIdMap: Map<number, number>;

  private constructor(
    font: TTFFont,
    customFontName?: string,
    vertical?: boolean,
    advanced?: EmbedFontAdvancedOptions,
  ) {
    super(font, customFontName, vertical, advanced);

    this.subset = this.font.createSubset();
    this.glyphs = [];
    this.glyphCache = Cache.populatedBy(() => this.glyphs);
    this.glyphIdMap = new Map();
  }

  /**
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
        const glyph = glyphs[idx];
        const subsetGlyphId = this.subset.includeGlyph(glyph);

        this.glyphs[subsetGlyphId - 1] = glyph;
        this.glyphIdMap.set(glyph.id, subsetGlyphId);

        hexCodes[idx] = toHexStringOfMinLength(subsetGlyphId, 4);
      }
    } else {
      const glyphIds = text;
      hexCodes = new Array(glyphIds.length);

      for (let idx = 0, len = glyphIds.length; idx < len; idx++) {
        const glyph = this.font.getGlyph(glyphIds[idx]);
        const subsetGlyphId = this.subset.includeGlyph(glyph);

        this.glyphs[subsetGlyphId - 1] = glyph;
        this.glyphIdMap.set(glyph.id, subsetGlyphId);

        hexCodes[idx] = toHexStringOfMinLength(subsetGlyphId, 4);
      }
    }

    this.glyphCache.invalidate();
    return PDFHexString.of(hexCodes.join(''));
  }

  protected isCFF(): boolean {
    return this.subset.type === 'CFF';
  }

  protected glyphId(glyph?: Glyph): number {
    return glyph ? this.glyphIdMap.get(glyph.id)! : -1;
  }

  protected serializeFont(): Uint8Array {
    return this.subset.encode();
  }
}
