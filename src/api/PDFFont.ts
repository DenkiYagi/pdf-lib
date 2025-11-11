import type { LayoutAdvancedParams, TTFFont } from '@denkiyagi/fontkit';
import type { Font as RawStandardFont } from '@pdf-lib/standard-fonts';
import type { Embeddable } from 'src/api//Embeddable';
import { PDFDocument } from 'src/api/PDFDocument';
import {
  AbstractCustomFontEmbedder,
  PDFHexString,
  PDFRef,
  StandardFontEmbedder,
} from 'src/core';
import type { SingleLineTextOrGlyphs } from 'src/types/text';
import { assertIs, assertOrUndefined } from 'src/utils';

export type FontEmbedder =
  | AbstractCustomFontEmbedder
  | StandardFontEmbedder;

/**
 * Represents a font that has been embedded in a [[PDFDocument]].
 */
export class PDFFont implements Embeddable {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.embedFont]] and
   * > [[PDFDocument.embedStandardFont]] methods, which will create instances
   * > of [[PDFFont]] for you.
   *
   * Create an instance of [[PDFFont]] from an existing ref and embedder
   *
   * @param ref The unique reference for this font.
   * @param doc The document to which the font will belong.
   * @param embedder The embedder that will be used to embed the font.
   */
  static of = (ref: PDFRef, doc: PDFDocument, embedder: FontEmbedder) =>
    new PDFFont(ref, doc, embedder);

  /** The unique reference assigned to this font within the document. */
  readonly ref: PDFRef;

  /** The document to which this font belongs. */
  readonly doc: PDFDocument;

  /** The name of this font. */
  readonly name: string;

  private modified = true;
  private readonly embedder: FontEmbedder;

  private constructor(ref: PDFRef, doc: PDFDocument, embedder: FontEmbedder) {
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    assertIs(embedder, 'embedder', [
      [AbstractCustomFontEmbedder, 'AbstractCustomFontEmbedder'],
      [StandardFontEmbedder, 'StandardFontEmbedder'],
    ]);

    this.ref = ref;
    this.doc = doc;
    this.name = embedder.fontName;

    this.embedder = embedder;
  }

  /**
   * > **NOTE:** You probably don't need to call this method directly. The
   * > [[PDFPage.drawText]] method will automatically encode the text it is
   * > given.
   *
   * Encodes a string of text in this font.
   *
   * @param text The text to be encoded.
   * @param layoutAdvancedParams Only for custom fonts. Specify this to pass it to `fontkit` instead of the one that the font embedder itself has.
   * @returns The encoded text as a hex string.
   */
  encodeText(
    text: SingleLineTextOrGlyphs,
    layoutAdvancedParams?: LayoutAdvancedParams,
  ): PDFHexString {
    assertIs(text, 'text', ['string', Array, Uint16Array, Uint32Array]);
    this.modified = true;
    return this.embedder.encodeText(text, layoutAdvancedParams);
  }

  /**
   * Measure the width of a string of text drawn in this font at a given size.
   * For example:
   * ```js
   * const width = font.widthOfTextAtSize('Foo Bar Qux Baz', 36)
   * ```
   * @param text The string of text to be measured.
   * @param size The font size to be used for this measurement.
   * @returns The width of the string of text when drawn in this font at the
   *          given size.
   */
  widthOfTextAtSize(text: string, size: number): number {
    assertIs(text, 'text', ['string']);
    assertIs(size, 'size', ['number']);
    return this.embedder.widthOfTextAtSize(text, size);
  }

  /**
   * Measure the height of this font at a given size. For example:
   * ```js
   * const height = font.heightAtSize(24)
   * ```
   *
   * The `options.descender` value controls whether or not the font's
   * descender is included in the height calculation.
   *
   * @param size The font size to be used for this measurement.
   * @param options The options to be used when computing this measurement.
   * @returns The height of this font at the given size.
   */
  heightAtSize(size: number, options?: { descender?: boolean }): number {
    assertIs(size, 'size', ['number']);
    assertOrUndefined(options?.descender, 'options.descender', ['boolean']);
    return this.embedder.heightOfFontAtSize(size, {
      descender: options?.descender ?? true,
    });
  }

  /**
   * Compute the font size at which this font is a given height. For example:
   * ```js
   * const fontSize = font.sizeAtHeight(12)
   * ```
   * @param height The height to be used for this calculation.
   * @returns The font size at which this font is the given height.
   */
  sizeAtHeight(height: number): number {
    assertIs(height, 'height', ['number']);
    return this.embedder.sizeOfFontAtHeight(height);
  }

  /**
   * Get the set of unicode code points that can be represented by this font.
   * @returns The set of unicode code points supported by this font.
   */
  getCharacterSet(): number[] {
    if (this.embedder instanceof StandardFontEmbedder) {
      return this.embedder.encoding.supportedCodePoints;
    }
    return this.embedder.font.characterSet;
  }

  /**
   * @returns The raw standard font instance if `this` is a standard font, otherwise `null`.
   */
  getRawStandardFont(): RawStandardFont | null {
    if (this.embedder instanceof StandardFontEmbedder) {
      return this.embedder.font;
    }
    return null;
  }

  /**
   * @returns The raw standard font instance if `this` is a custom font, otherwise `null`.
   */
  getRawCustomFont(): TTFFont | null {
    if (this.embedder instanceof AbstractCustomFontEmbedder) {
      return this.embedder.font;
    }
    return null;
  }

  /**
   * > **NOTE:** You probably don't need to call this method directly. The
   * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
   * > automatically ensure all fonts get embedded.
   *
   * Embed this font in its document.
   *
   * @returns Resolves when the embedding is complete.
   */
  async embed(): Promise<void> {
    // TODO: Cleanup orphan embedded objects if a font is embedded multiple times...
    if (this.modified) {
      await this.embedder.embedIntoContext(this.doc.context, this.ref);
      this.modified = false;
    }
  }
}
