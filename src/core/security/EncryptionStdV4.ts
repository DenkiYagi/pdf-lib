import type { PDFRef } from 'src/core/objects/PDFRef';
import type { Encrypter } from 'src/core/objects/EncryptableObject';
import {
  Encryption,
  EncryptionKey,
  EncryptionDictStd,
} from 'src/core/security/Encryption';
import type { SecurityOptions } from 'src/core/security/PDFSecurity';
import { StdSecurityHandlerR4 } from 'src/core/security/StdSecurityHandlerR4';
import {
  MD5,
  encryptAES,
  wordArray,
  wordArrayFromBytes,
  wordArrayToBytes,
  wordArrayRandom,
  WordArray,
} from 'src/utils/crypt';

/**
 * Subtype of `EncryptionKey` to be used when using encryption algorithm version 4.
 */
export class EncryptionKeyV4 extends EncryptionKey {
  protected createEncrypter(reference: PDFRef): EncrypterV4 {
    return new EncrypterV4(this.data, reference);
  }
}

type AesParams = {
  aesKey: WordArray;
  initializationVector: WordArray;
};

/**
 * Implementation of `Encrypter` to be used when using encryption algorithm version 4 (with AES).
 *
 * @see ISO 32000-1 > 7.6.2 General Encryption Algorithm > Algorithm 1:
 *   Encryption of data using the RC4 or AES algorithms
 */
class EncrypterV4 implements Encrypter {
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
    key.concat(wordArray(exWords, 5));

    // Append "sAlT" (AES salt string)
    key.concat(wordArray([0x73416c54], 4));

    // Use the first (n + 5) bytes
    const digestedKey = MD5(key);
    digestedKey.sigBytes = Math.min(encryptionKey.sigBytes + 5, 16);

    return digestedKey;
  }

  /** Actual bytes that constitute the encryption key. */
  protected encryptionKey: WordArray;

  /** Reference to the indirect object to be encrypted. */
  protected reference: PDFRef;

  /** Cache of data to be used for AES encryption. */
  protected aesParamsCache: AesParams | null = null;

  constructor(encryptionKey: WordArray, reference: PDFRef) {
    this.encryptionKey = encryptionKey;
    this.reference = reference;
  }

  encryptData(data: Uint8Array): Uint8Array {
    const { aesKey, initializationVector } = this.prepareAes();
    const encryptedContent = encryptAES(
      wordArrayFromBytes(data),
      aesKey,
      initializationVector,
    );

    // Initialization vector should be stored as the first 16 bytes of the encrypted data.
    const encryptedResult = initializationVector
      .clone()
      .concat(encryptedContent);

    return wordArrayToBytes(encryptedResult);
  }

  protected prepareAes(): AesParams {
    if (this.aesParamsCache != null) return this.aesParamsCache;

    const prepared = {
      aesKey: EncrypterV4.createAesKey(this.encryptionKey, this.reference),
      initializationVector: wordArrayRandom(16),
    };
    this.aesParamsCache = prepared;

    return prepared;
  }
}

/**
 * Prepare for encryption using standard security handler and encryption algorithm version 4.
 */
export function prepareEncryptionStdV4(
  documentFirstId: Uint8Array,
  keyBitLength: number,
  options: SecurityOptions,
): Encryption {
  const securityHandler = new StdSecurityHandlerR4({
    documentFirstId,
    keyBitLength,
    password: options.password,
  });
  const key = securityHandler.computeEncryptionKey();
  const shDict = securityHandler.createEncryptionDictEntries();

  const dictionary: EncryptionDictStd = {
    Filter: 'Standard',
    V: 4,
    CF: {
      StdCF: {
        CFM: 'AESV2',
        Length: keyBitLength / 8,
      },
    },
    StmF: 'StdCF',
    StrF: 'StdCF',
    Length: keyBitLength,
    ...shDict,
  };

  return {
    key: new EncryptionKeyV4(key),
    dictionary,
  };
}
