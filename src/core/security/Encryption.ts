import type { LiteralObject } from 'src/core/PDFContext';
import type { WordArray } from 'src/core/security/WordArray';

export type EncryptFn = (buffer: Uint8Array) => Uint8Array;

export type EncryptionAlgorithmVersion = 4 | 5;

export interface EncryptionDict extends LiteralObject {
  V: EncryptionAlgorithmVersion;
  Filter: 'Standard';
  CF: {
    StdCF: {
      AuthEvent: 'DocOpen';
      CFM: 'AESV2' | 'AESV3';
    };
  };
  StmF: 'StdCF';
  StrF: 'StdCF';
}

export type Encryption = {
  key: WordArray;
  dictionary: EncryptionDict;
};
