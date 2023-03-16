import type { PDFObject } from 'src/core/objects/PDFObject';

/**
 * Object that can be encrypted to another `PDFObject`.
 */
export interface EncryptableObject {
  /**
   * Encrypt this object and returns the result as a new `PDFObject`.
   */
  encryptWith(encrypter: Encrypter): PDFObject;
}

/**
 * Object that can encrypt any `EncryptableObject`.
 */
export interface Encrypter {
  /**
   * Encrypt arbitrary bytes.
   */
  encryptData(data: Uint8Array): Uint8Array;
}
