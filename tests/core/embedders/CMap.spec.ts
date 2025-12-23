import * as fontkit from '@denkiyagi/fontkit';
import type { TTFFont, Glyph } from '@denkiyagi/fontkit';
import fs from 'fs';

import { createCmap } from 'src/core/embedders/CMap.js';
import { byAscendingId, sortedUniq } from 'src/utils/index.js';

const ubuntuFont = fs.readFileSync('./assets/fonts/ubuntu/Ubuntu-R.ttf');
const sourceHansJpFont = fs.readFileSync(
  './assets/fonts/source_hans_jp/SourceHanSerifJP-Regular.otf',
);

const ubuntuFontCmap = fs.readFileSync(
  './tests/core/embedders/data/Ubuntu-R.ttf.cmap',
);
const sourceHansJpFontCmap = fs.readFileSync(
  './tests/core/embedders/data/SourceHanSerifJP-Regular.otf.cmap',
);

const allGlyphsInFontSortedById = (font: TTFFont) => {
  const glyphs: Glyph[] = new Array(font.characterSet.length);
  for (let idx = 0, len = glyphs.length; idx < len; idx++) {
    const codePoint = font.characterSet[idx];
    glyphs[idx] = font.glyphForCodePoint(codePoint);
  }
  return sortedUniq(glyphs.sort(byAscendingId), (g) => g.id);
};

describe(`createCmap`, () => {
  it(`creates CMaps for embedded Ubuntu-R font files`, () => {
    const font = fontkit.create(ubuntuFont);
    if (font.type !== 'TTF') assert.fail(`Invalid font type: ${font.type}`);

    const glyphs = allGlyphsInFontSortedById(font);
    const cmap = createCmap(glyphs, (g) => (g ? g.id : -1));

    expect(cmap).toEqual(String(ubuntuFontCmap));
  });

  it(`creates CMaps for embedded SourceHanSerifJP-Regular font files`, () => {
    const font = fontkit.create(sourceHansJpFont);
    if (font.type !== 'TTF') assert.fail(`Invalid font type: ${font.type}`);

    const glyphs = allGlyphsInFontSortedById(font);
    const cmap = createCmap(glyphs, (g) => (g ? g.id : -1));

    expect(cmap).toEqual(String(sourceHansJpFontCmap));
  });
});
