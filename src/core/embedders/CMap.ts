import type { Glyph } from '@denkiyagi/fontkit';

import { InvalidUnicodeCodePointError } from 'src/core/errors.js';
import { PDFLibErrorTypes } from 'src/core/error-base.js';
import { toHexStringOfMinLength } from 'src/utils/index.js';
import {
  hasSurrogates,
  highSurrogate,
  isWithinBMP,
  lowSurrogate,
} from 'src/utils/unicode.js';

/** [fontId, codePoint] */
type BfChar = [string, string];

/** `glyphs` should be an array of unique glyphs */
export const createCmap = (glyphs: Glyph[], glyphId: (g?: Glyph) => number) => {
  const bfChars: BfChar[] = new Array(glyphs.length);
  for (let idx = 0, len = glyphs.length; idx < len; idx++) {
    const glyph = glyphs[idx];
    const id = cmapHexFormat(cmapHexString(glyphId(glyph)));
    const unicode = cmapHexFormat(...glyph.codePoints.map(cmapCodePointFormat));
    bfChars[idx] = [id, unicode];
  }

  return fillCmapTemplate(bfChars);
};

/* =============================== Templates ================================ */

const fillCmapTemplate = (bfChars: BfChar[]) => `\
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000><ffff>
endcodespacerange
${bfChars.length} beginbfchar
${bfChars.map(([glyphId, codePoint]) => `${glyphId} ${codePoint}`).join('\n')}
endbfchar
endcmap
CMapName currentdict /CMap defineresource pop
end
end\
`;

/* =============================== Utilities ================================ */

const cmapHexFormat = (...values: string[]) => `<${values.join('')}>`;

const cmapHexString = (value: number) => toHexStringOfMinLength(value, 4);

const cmapCodePointFormat = (codePoint: number) => {
  if (isWithinBMP(codePoint)) return cmapHexString(codePoint);

  if (hasSurrogates(codePoint)) {
    const hs = highSurrogate(codePoint);
    const ls = lowSurrogate(codePoint);
    return `${cmapHexString(hs)}${cmapHexString(ls)}`;
  }

  throw new InvalidUnicodeCodePointError(
    codePoint,
    PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA,
    'not a valid UTF-8 or UTF-16 codepoint',
  );
};
