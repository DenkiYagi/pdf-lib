import type { PDFRef } from 'src/core/objects/PDFRef';

/**
 * Object that can encrypt arbitrary PDF object.
 */
export interface ObjectEncrypter {
  /**
   * Encrypt content of any `PDFObject`.
   * @param data Unencrypted data of the `PDFObject` to be encrypted.
   * @param reference Indirect reference to the `PDFObject` to be encrypted.
   *   If the object in question is a direct object, pass a reference to an
   *   indirect object that contains the object to be encrypted.
   */
  encryptObjectContent(data: Uint8Array, reference: PDFRef): Uint8Array;
}
