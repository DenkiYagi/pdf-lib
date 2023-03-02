import CryptoJS from 'crypto-js';
import type { PDFDocument } from 'src/api/PDFDocument';
import type { PDFDict } from 'src/core/objects/PDFDict';
import type {
  EncDict,
  EncDictV,
  Encryption,
} from 'src/core/security/Encryption';
import {
  setupEncryptionR4,
  setupEncryptionR5,
} from 'src/core/security/Encryption';
import type { WordArray } from 'src/core/security/WordArray';
import { wordArrayToBuffer } from 'src/core/security/WordArray';

/**
 * Interface option for security
 * @interface SecurityOption
 */
export interface SecurityOption {
  /**
   * Password that provide unlimited access to the encrypted document.
   *
   * Opening encrypted document with owner password allow full (owner) access to the document
   */
  ownerPassword: string;

  /** Version of PDF, string of '1.x' */
  pdfVersion?: string;
}

/* 
Represent the entire security class for the PDF Document
Output from `_setupEncryption` is the Encryption Dictionary
in compliance to the PDF Specification 
*/
export class PDFSecurity {
  dictionary!: EncDict;
  encryptionKey!: WordArray;

  /*   
  ID file is an array of two byte-string constituing 
  a file identifier

  Required if Encrypt entry is present in Trailer
  Doesn't really matter what it is as long as it is 
  consistently used. 
  */
  static generateFileID(info: PDFDict): Uint8Array {
    return wordArrayToBuffer(CryptoJS.MD5(info.toString()));
  }

  static create(
    document: PDFDocument,
    options: SecurityOption = {} as SecurityOption,
  ) {
    return new PDFSecurity(document, options);
  }

  constructor(
    document: PDFDocument,
    options: SecurityOption = {} as SecurityOption,
  ) {
    if (!options.ownerPassword) {
      throw new Error('No owner password is defined.');
    }

    this._setupEncryption(document._id, options);
  }

  /* 
  Handle all encryption process and give back 
  EncryptionDictionary that is required
  to be plugged into Trailer of the PDF 
  */
  _setupEncryption(documentId:Uint8Array, options: SecurityOption) {
    let version: EncDictV;
    switch (options.pdfVersion) {
      case '1.7ext3':
        version = 5;
        break;
      default:
        version = 4;
        break;
    }

    let encryption: Encryption;
    switch (version) {
      case 4:
        encryption = setupEncryptionR4(version, documentId, options);
        break;
      case 5:
        encryption = setupEncryptionR5(options);
        break;
    }
    this.encryptionKey = encryption.key;
    this.dictionary = encryption.dictionary;
  }

  getEncryptFn(obj: number, gen: number) {
    let key: WordArray;
    if (this.dictionary.V === 4) {
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
    } else if (this.dictionary.V === 5) {
      key = this.encryptionKey;
    } else {
      throw new Error('Unknown V value');
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
