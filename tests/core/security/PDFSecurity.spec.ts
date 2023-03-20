import { PDFSecurity } from 'src/core/security/PDFSecurity';

describe(`PDFSecurity`, () => {
  describe(`from() method`, () => {
    it(`Creates a PDFSecurity instance`, () => {
      const { security } = PDFSecurity.create(new Uint8Array([0]), {
        password: 'password',
      });
      expect(security).toBeInstanceOf(PDFSecurity);
    });

    it(`Creates an object for the Encrypt entry with standard security handler, algorithm version 4, AES-128`, () => {
      const { encryptionDictionary } = PDFSecurity.create(new Uint8Array([0]), {
        password: 'password',
      });
      expect(encryptionDictionary.Filter).toBe('Standard');
      expect(encryptionDictionary.V).toBe(4);
      expect(encryptionDictionary.Length).toBe(128);
      expect(encryptionDictionary.CF).toEqual({
        StdCF: {
          CFM: 'AESV2',
          Length: 128 / 8,
        },
      });
      expect(encryptionDictionary.StmF).toBe('StdCF');
      expect(encryptionDictionary.StrF).toBe('StdCF');

      expect(encryptionDictionary.R).toBe(4);
      expect(encryptionDictionary.O).toBeInstanceOf(Uint8Array);
      expect(encryptionDictionary.U).toBeInstanceOf(Uint8Array);
      expect(encryptionDictionary.P).toBe(0);
    });

    it(`Creates owner password value addording to the given password string`, () => {
      const cases = new Map<{ id: Uint8Array; password: string }, Uint8Array>();
      cases.set(
        { id: new Uint8Array([0]), password: 'password' },
        new Uint8Array([
          64, 139, 55, 188, 241, 45, 168, 115, 215, 242, 132, 15, 60, 27, 145,
          122, 2, 57, 97, 222, 212, 200, 22, 77, 56, 228, 110, 150, 85, 230,
          103, 117,
        ]),
      );
      cases.set(
        { id: new Uint8Array([1]), password: 'password' },
        // same as the above
        new Uint8Array([
          64, 139, 55, 188, 241, 45, 168, 115, 215, 242, 132, 15, 60, 27, 145,
          122, 2, 57, 97, 222, 212, 200, 22, 77, 56, 228, 110, 150, 85, 230,
          103, 117,
        ]),
      );
      cases.set(
        { id: new Uint8Array([0]), password: 'anotherpassword' },
        new Uint8Array([
          53, 84, 196, 144, 24, 240, 179, 137, 35, 126, 199, 205, 18, 73, 237,
          86, 6, 139, 151, 170, 252, 172, 99, 58, 160, 204, 46, 24, 220, 89,
          196, 178,
        ]),
      );
      cases.set(
        { id: new Uint8Array([1]), password: 'anotherpassword' },
        // same as the above
        new Uint8Array([
          53, 84, 196, 144, 24, 240, 179, 137, 35, 126, 199, 205, 18, 73, 237,
          86, 6, 139, 151, 170, 252, 172, 99, 58, 160, 204, 46, 24, 220, 89,
          196, 178,
        ]),
      );

      for (const [input, expectedO] of cases.entries()) {
        const { encryptionDictionary } = PDFSecurity.create(input.id, {
          password: input.password,
        });
        expect(encryptionDictionary.O).toEqual(expectedO);
      }
    });

    it(`Creates user password value addording to the ID and the given password string`, () => {
      const cases = new Map<{ id: Uint8Array; password: string }, Uint8Array>();
      cases.set(
        { id: new Uint8Array([0]), password: 'password' },
        new Uint8Array([
          151, 154, 125, 222, 5, 128, 193, 61, 92, 50, 158, 147, 172, 200, 21,
          236, 40, 191, 78, 94, 78, 117, 138, 65, 100, 0, 78, 86, 255, 250, 1,
          8, 46, 46, 0, 182, 208, 104, 62, 128, 47, 12, 169, 254, 100, 83, 105,
          122,
        ]),
      );
      cases.set(
        { id: new Uint8Array([1]), password: 'password' },
        new Uint8Array([
          235, 101, 71, 201, 13, 249, 39, 64, 71, 163, 191, 1, 75, 250, 166,
          197, 40, 191, 78, 94, 78, 117, 138, 65, 100, 0, 78, 86, 255, 250, 1,
          8, 46, 46, 0, 182, 208, 104, 62, 128, 47, 12, 169, 254, 100, 83, 105,
          122,
        ]),
      );
      cases.set(
        { id: new Uint8Array([0]), password: 'anotherpassword' },
        new Uint8Array([
          105, 165, 13, 85, 211, 14, 160, 149, 165, 243, 185, 29, 133, 91, 22,
          184, 40, 191, 78, 94, 78, 117, 138, 65, 100, 0, 78, 86, 255, 250, 1,
          8, 46, 46, 0, 182, 208, 104, 62, 128, 47, 12, 169, 254, 100, 83, 105,
          122,
        ]),
      );
      cases.set(
        { id: new Uint8Array([1]), password: 'anotherpassword' },
        new Uint8Array([
          132, 224, 68, 112, 80, 228, 36, 22, 163, 162, 62, 212, 241, 225, 226,
          239, 40, 191, 78, 94, 78, 117, 138, 65, 100, 0, 78, 86, 255, 250, 1,
          8, 46, 46, 0, 182, 208, 104, 62, 128, 47, 12, 169, 254, 100, 83, 105,
          122,
        ]),
      );

      for (const [input, expectedU] of cases.entries()) {
        const { encryptionDictionary } = PDFSecurity.create(input.id, {
          password: input.password,
        });
        expect(encryptionDictionary.U).toEqual(expectedU);
      }
    });
  });
});
