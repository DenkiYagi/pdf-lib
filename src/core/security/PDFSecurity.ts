import CryptoJS from 'crypto-js';
import type {
  EncryptionDict,
  EncryptionAlgorithmVersion,
  Encryption,
} from 'src/core/security/Encryption';
import type { WordArray } from 'src/core/security/WordArray';
import { wordArrayToBuffer } from 'src/core/security/WordArray';
import { setupEncryptionV4 } from 'src/core/security/EncryptionV4';
// import { setupEncryptionV5 } from 'src/core/security/EncryptionV5';

export interface SecurityOptions {
  /**
   * Password that provides unlimited access to the encrypted document.
   *
   * Opening encrypted document with owner password allow full (owner) access to the document.
   */
  ownerPassword: string;
}

/*
 * Generated when encrypting any unencrypted PDF Document.
 */
export class PDFSecurity {
  encryptionKey: WordArray;
  encryptionDict: EncryptionDict;

  /*
   * Generate MD5 hash bytes from any arbitrary string.
   */
  static getHashBytesMD5(s: string): Uint8Array {
    return wordArrayToBuffer(CryptoJS.MD5(s));
  }

  /**
   * @param firstId The first element of the PDF file identifier.
   * @param options
   */
  static create(
    firstId: Uint8Array,
    options: SecurityOptions = {} as SecurityOptions,
  ) {
    return new PDFSecurity(firstId, options);
  }

  constructor(
    firstId: Uint8Array,
    options: SecurityOptions = {} as SecurityOptions,
  ) {
    if (!options.ownerPassword) {
      throw new Error('No owner password is defined.');
    }

    const version: EncryptionAlgorithmVersion = 4; // TODO: consider supporting V5

    let encryption: Encryption;
    switch (version) {
      case 4:
        encryption = setupEncryptionV4(firstId, options);
        break;
      // case 5:
      //   encryption = setupEncryptionV5(options);
      //   break;
    }
    this.encryptionKey = encryption.key;
    this.encryptionDict = encryption.dictionary;
  }

  getEncryptFn(obj: number, gen: number) {
    let key: WordArray;
    if (this.encryptionDict.V === 4) {
      const digest = this.encryptionKey
        .clone()
        .concat(
          CryptoJS.lib.WordArray.create(
            [
              ((obj & 0xff) << 24) |
                ((obj & 0xff00) << 8) |
                ((obj >> 8) & 0xff00) |
                (gen & 0xff),
              (gen & 0xff00) << 16,
            ],
            5,
          ),
        );
      key = CryptoJS.MD5(
        digest.concat(CryptoJS.lib.WordArray.create([0x73416c54], 4)),
      );
    } else if (this.encryptionDict.V === 5) {
      key = this.encryptionKey;
    } else {
      throw new Error(`Unknown V value: ${this.encryptionDict.V}`);
    }

    const iv = CryptoJS.lib.WordArray.random(16);
    const options = {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv,
    };

    return (buffer: Uint8Array) =>
      wordArrayToBuffer(
        iv
          .clone()
          .concat(
            CryptoJS.AES.encrypt(
              CryptoJS.lib.WordArray.create(buffer as unknown as number[]),
              key,
              options,
            ).ciphertext,
          ),
      );
  }
}
