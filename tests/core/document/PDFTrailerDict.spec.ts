import { PDFContext } from '../../../src/core/PDFContext.js';
import { PDFTrailerDict } from '../../../src/core/document/PDFTrailerDict.js';
import { typedArrayFor } from '../../../src/utils/arrays.js';
import { toCharCode } from '../../../src/utils/strings.js';

describe(`PDFTrailerDict`, () => {
  const dict = PDFContext.create().obj({ Foo: 'Bar' });

  it(`can be constructed from PDFTrailerDict.of(...)`, () => {
    expect(PDFTrailerDict.of(dict)).toBeInstanceOf(PDFTrailerDict);
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFTrailerDict.of(dict))).toBe('trailer\n<<\n/Foo /Bar\n>>');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFTrailerDict.of(dict).sizeInBytes()).toBe(23);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(27).fill(toCharCode(' '));
    expect(PDFTrailerDict.of(dict).copyBytesInto(buffer, 3)).toBe(23);
    expect(buffer).toEqual(typedArrayFor('   trailer\n<<\n/Foo /Bar\n>> '));
  });
});
