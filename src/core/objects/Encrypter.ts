/**
 * Object that can encrypt arbitrary data.
 */
export interface Encrypter {
  /**
   * Encrypt arbitrary bytes.
   */
  encryptData(data: Uint8Array): Uint8Array;
}
