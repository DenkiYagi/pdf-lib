import { PrivateConstructorError } from '../../../src/core/errors.js';
import { PDFBool } from '../../../src/core/objects/PDFBool.js';
import { PDFRef } from '../../../src/core/objects/PDFRef.js';
import { typedArrayFor } from '../../../src/utils/arrays.js';
import { toCharCode } from '../../../src/utils/strings.js';
import { security } from './shared.js';

describe(`PDFBool`, () => {
  it(`cannot be publicly constructed`, () => {
    expect(() => new (PDFBool as any)({}, true)).toThrow(
      new PrivateConstructorError(PDFBool.name),
    );
  });

  it(`can be converted to a boolean`, () => {
    expect(PDFBool.True.asBoolean()).toBe(true);
    expect(PDFBool.False.asBoolean()).toBe(false);
  });

  it(`can be cloned`, () => {
    expect(PDFBool.True.clone()).toBe(PDFBool.True);
    expect(PDFBool.False.clone()).toBe(PDFBool.False);
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFBool.True)).toBe('true');
    expect(String(PDFBool.False)).toBe('false');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFBool.True.sizeInBytes()).toBe(4);
    expect(PDFBool.False.sizeInBytes()).toBe(5);
  });

  it(`can be serialized when true`, () => {
    const buffer = new Uint8Array(8).fill(toCharCode(' '));
    expect(PDFBool.True.copyBytesInto(buffer, 3)).toBe(4);
    expect(buffer).toEqual(typedArrayFor('   true '));
  });

  it(`can be serialized when false`, () => {
    const buffer = new Uint8Array(9).fill(toCharCode(' '));
    expect(PDFBool.False.copyBytesInto(buffer, 1)).toBe(5);
    expect(buffer).toEqual(typedArrayFor(' false   '));
  });

  it(`can never be encrypted`, () => {
    const { encryptionKey: key } = security;
    const ref = PDFRef.of(1);
    expect(PDFBool.True.encryptWith(key, ref)).toBe(null);
    expect(PDFBool.False.encryptWith(key, ref)).toBe(null);
  });
});
