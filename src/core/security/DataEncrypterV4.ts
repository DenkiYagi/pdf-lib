import type { PDFRef } from 'src/core/objects/PDFRef';
import {
  MD5,
  encryptAES,
  createWordArray,
  wordArrayFromBytes,
  wordArrayToBytes,
  wordArrayRandom,
  WordArray,
} from 'src/utils/crypt';

/**
 * (For internal use in `EncryptionKeyV4`)
 *
 * Object that can encrypt arbitrary data.
 * To be used when using encryption algorithm version 4 (with AES).
 *
 * @see ISO 32000-1 > 7.6.2 General Encryption Algorithm > Algorithm 1:
 *   Encryption of data using the RC4 or AES algorithms
 */
export class DataEncrypterV4 {
  /**
   * Create a key for encrypting any data using AES algorithm.
   */
  private static createAesKey(
    encryptionKey: WordArray,
    ref: PDFRef,
  ): WordArray {
    const key = encryptionKey.clone();
    const { objectNumber, generationNumber } = ref;

    // Append 5 bytes, reversing the byte order
    const exByte0 = (objectNumber & 0xff) << 24;
    const exByte1 = (objectNumber & 0xff00) << 8;
    const exByte2 = (objectNumber & 0xff0000) >>> 8;
    const exByte3 = generationNumber & 0xff;
    const exByte4 = (generationNumber & 0xff00) << 16;
    const exWords = [exByte0 | exByte1 | exByte2 | exByte3, exByte4];
    key.concat(createWordArray(exWords, 5));

    // Append "sAlT" (AES salt string)
    key.concat(createWordArray([0x73416c54], 4));

    // Use the first (n + 5) bytes
    const digestedKey = MD5(key);
    digestedKey.sigBytes = Math.min(encryptionKey.sigBytes + 5, 16);

    return digestedKey;
  }

  protected readonly aesKey: WordArray;

  constructor(encryptionKey: WordArray, reference: PDFRef) {
    this.aesKey = DataEncrypterV4.createAesKey(encryptionKey, reference);
  }

  encryptData(data: Uint8Array): Uint8Array {
    const initializationVector = wordArrayRandom(16);

    const encryptedContent = encryptAES(
      wordArrayFromBytes(data),
      this.aesKey,
      initializationVector,
    );

    // Initialization vector should be stored as the first 16 bytes of the encrypted data.
    const encryptedResult = initializationVector
      .clone()
      .concat(encryptedContent);

    return wordArrayToBytes(encryptedResult);
  }
}
