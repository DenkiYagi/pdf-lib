import { PDFBool, PDFHexString, PDFObject, PDFRef } from 'src/core';
import { PDFSecurity } from 'src/core/security/PDFSecurity';
import { typedArrayFor } from 'src/utils';
import { mockRandom, resetMock } from './mock';

describe(`EncryptionKey`, () => {
  const { security } = PDFSecurity.create(new Uint8Array([0]), {
    password: 'password',
  });
  const { encryptionKey } = security;

  describe('encryptObjectContent() method', () => {
    it(`Encrypts given data according to the reference values and a random initialization vector`, () => {
      const data = typedArrayFor('foobar');

      mockRandom(0);

      expect(encryptionKey.encryptObjectContent(data, PDFRef.of(1, 0))).toEqual(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 136, 156, 43, 55, 45,
          124, 92, 180, 74, 29, 228, 158, 185, 120, 73, 38,
        ]),
      );
      expect(encryptionKey.encryptObjectContent(data, PDFRef.of(2, 0))).toEqual(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 162, 249, 203,
          119, 253, 30, 243, 18, 131, 16, 40, 18, 55, 150, 127,
        ]),
      );
      expect(encryptionKey.encryptObjectContent(data, PDFRef.of(1, 1))).toEqual(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 164, 109, 41, 112,
          116, 88, 58, 36, 41, 49, 65, 244, 19, 40, 79,
        ]),
      );

      mockRandom(1);

      expect(encryptionKey.encryptObjectContent(data, PDFRef.of(1, 0))).toEqual(
        new Uint8Array([
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 38, 29, 41, 169, 172,
          186, 178, 41, 7, 206, 213, 110, 253, 220, 184, 99,
        ]),
      );
      expect(encryptionKey.encryptObjectContent(data, PDFRef.of(2, 0))).toEqual(
        new Uint8Array([
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 186, 219, 144, 64, 13,
          105, 43, 92, 9, 222, 235, 12, 85, 73, 204, 226,
        ]),
      );
      expect(encryptionKey.encryptObjectContent(data, PDFRef.of(1, 1))).toEqual(
        new Uint8Array([
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 95, 121, 110, 96, 98,
          190, 210, 24, 44, 29, 138, 184, 149, 150, 81, 131,
        ]),
      );

      resetMock();
    });
  });

  describe('encryptIfPossible() method', () => {
    it(`Encrypts the given indirect object if possible`, () => {
      mockRandom(0);

      const input: [PDFRef, PDFObject] = [
        PDFRef.of(1, 0),
        PDFHexString.fromText('foobar'),
      ];
      const expected: [PDFRef, PDFObject] = [
        PDFRef.of(1, 0),
        PDFHexString.fromText('foobar').encryptWith(
          encryptionKey,
          PDFRef.of(1, 0),
        )!,
      ];
      encryptionKey.encryptIfPossible(input);
      expect(input).toEqual(expected);

      resetMock();
    });

    it(`Has no effect if the given indirect object is not encryptable`, () => {
      const input: [PDFRef, PDFObject] = [PDFRef.of(1, 0), PDFBool.True];
      const expected = input.slice();
      encryptionKey.encryptIfPossible(input);
      expect(input).toEqual(expected);
    });
  });
});
