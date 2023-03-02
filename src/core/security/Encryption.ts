import type { LiteralObject } from 'src/core/PDFContext';
import type { WordArray } from 'src/core/security/WordArray';

export type EncryptFn = (buffer: Uint8Array) => Uint8Array;

export interface StdCF {
  AuthEvent: 'DocOpen';
  CFM: 'AESV2' | 'AESV3';
}

export interface CF {
  StdCF: StdCF;
}

export type EncDictV = 4 | 5;
export type EncDictR = 4 | 5;
export type EncKeyBits = 128 | 256;

interface EncDictBase extends LiteralObject {
  R: EncDictR;
  O: Uint8Array;
  U: Uint8Array;
  P: number;
  V: EncDictV;
  Filter: 'Standard';
}

export interface EncDictV4 extends EncDictBase {
  CF: CF;
  StmF: 'StdCF';
  StrF: 'StdCF';
}

export interface EncDictV5 extends EncDictBase {
  OE: Uint8Array;
  UE: Uint8Array;
  Perms: Uint8Array;
  CF: CF;
  StmF: 'StdCF';
  StrF: 'StdCF';
}

export type EncDict = EncDictV4 | EncDictV5;

export type Encryption = {
  keyBits: EncKeyBits;
  key: WordArray;
  dictionary: EncDict;
};

export { setupEncryptionR4 } from 'src/core/security/EncryptionR4';
export { setupEncryptionR5 } from 'src/core/security/EncryptionR5';
