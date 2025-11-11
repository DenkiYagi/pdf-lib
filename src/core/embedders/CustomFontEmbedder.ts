import { create as createFont } from '@denkiyagi/fontkit';
import type { TTFFont } from '@denkiyagi/fontkit';

import { AbstractCustomFontEmbedder } from 'src/core/embedders/AbstractCustomFontEmbedder';
import type { EmbedFontAdvancedOptions } from 'src/api';

export class CustomFontEmbedder extends AbstractCustomFontEmbedder {
  static for(
    fontData: Uint8Array,
    customFontName?: string,
    vertical?: boolean,
    advanced?: EmbedFontAdvancedOptions,
  ) {
    const font = createFont(fontData);
    if (font.type !== 'TTF') throw new Error(`Invalid font type: ${font.type}`);
    return new CustomFontEmbedder(
      font,
      fontData,
      customFontName,
      vertical,
      advanced,
    );
  }

  private readonly fontData: Uint8Array;

  private constructor(
    font: TTFFont,
    fontData: Uint8Array,
    customFontName?: string,
    vertical?: boolean,
    advanced?: EmbedFontAdvancedOptions,
  ) {
    super(font, customFontName, vertical, advanced);
    this.fontData = fontData;
  }

  protected serializeFont(): Uint8Array {
    return this.fontData;
  }
}
