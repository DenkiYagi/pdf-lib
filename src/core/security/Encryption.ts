import type { LiteralObject } from '../PDFContext.js';
import type { ObjectEncrypter } from '../objects/ObjectEncrypter.js';
import type { PDFObject } from '../objects/PDFObject.js';
import type { PDFRef } from '../objects/PDFRef.js';
import type { StdSecurityHandlerDict } from './StdSecurityHandler.js';
import type { WordArray } from '../../utils/crypt.js';

/**
 * Set of values that will be generated when preparing a PDF document for encryption.
 */
export interface Encryption {
  /**
   * The encryption key.
   */
  key: EncryptionKey;

  /**
   * The encryption dictionary that should be written to PDF file trailer.
   */
  dictionary: EncryptionDict;
}

type IndirectObject = [PDFRef, PDFObject];

/**
 * Object that holds an encryption key and provides an encrypting function.
 */
export abstract class EncryptionKey implements ObjectEncrypter {
  /**
   * Actual bytes that constitute the encryption key.
   */
  protected data: WordArray;

  constructor(key: WordArray) {
    this.data = key;
  }

  /**
   * Encrypt a specified indirect object if possible.
   * This changes the value of `indirectObject` in-place.
   */
  encryptIfPossible(indirectObject: IndirectObject): void {
    const [ref, obj] = indirectObject;
    const encryptedObj = obj.encryptWith(this, ref);
    if (encryptedObj != null) indirectObject[1] = encryptedObj;
  }

  abstract encryptObjectContent(
    data: Uint8Array,
    reference: PDFRef,
  ): Uint8Array;
}

/**
 * Entries that should be written to PDF file trailer when encrypting.
 */
export interface EncryptionDict extends LiteralObject {
  /**
   * Encryption algorithm version.
   */
  V?: number;

  /**
   * Name of security handler.
   */
  Filter: string;

  /**
   * Bit length of the encryption key.
   */
  Length?: number;

  /**
   * Mapping from crypt filter names to crypt filter dictionaries.
   */
  CF?: {
    [name: string]: CryptFilterDict;
  };

  /**
   * Name of the crypt filter to be used when decrypting streams.
   */
  StmF?: string;

  /**
   * Name of the crypt filter to be used when decrypting strings.
   */
  StrF?: string;
}

/**
 * Entries for a specific crypt filter.
 */
export interface CryptFilterDict extends LiteralObject {
  /**
   * Name of crypt filter method.
   */
  CFM?: 'None' | 'V2' | 'AESV2';

  /**
   * Length of the encryption key.
   */
  Length?: number;
}

/**
 * Crypt filter supported by standard security handler.
 * The crypt filter name should be `'StdCF'`.
 */
export interface StdCryptFilter extends CryptFilterDict {
  /**
   * Length of the encryption key, in bytes (`16` means 128 bits. See ISO32000-1).
   */
  Length?: number;
}

/**
 * Subtype of `EncryptionDict` to be used when using standard security handler.
 */
export interface EncryptionDictStd
  extends EncryptionDict,
    StdSecurityHandlerDict {
  Filter: 'Standard';
  CF: {
    StdCF: StdCryptFilter;
  };
  StmF: 'Identity' | 'StdCF';
  StrF: 'Identity' | 'StdCF';
}
