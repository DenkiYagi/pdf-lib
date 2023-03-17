import type { PDFRef } from 'src/core/objects/PDFRef';
import type { ObjectEncrypter } from 'src/core/objects/ObjectEncrypter';
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
export class EncryptionKeyV4 extends EncryptionKey implements ObjectEncrypter {
  protected readonly encrypterCacheMap = new Map<string, DataEncrypterV4>();

  encryptObjectContent(data: Uint8Array, reference: PDFRef): Uint8Array {
    return this.getEncrypter(reference).encryptData(data);
  }

  protected getEncrypter(reference: PDFRef): DataEncrypterV4 {
    let encrypter = this.encrypterCacheMap.get(reference.tag);
    if (encrypter == null) {
      encrypter = new DataEncrypterV4(this.data, reference);
      this.encrypterCacheMap.set(reference.tag, encrypter);
    }

    return encrypter;
  }
}

/**
 * Object that can encrypt arbitrary data.
 * To be used when using encryption algorithm version 4 (with AES).
 *
 * @see ISO 32000-1 > 7.6.2 General Encryption Algorithm > Algorithm 1:
 *   Encryption of data using the RC4 or AES algorithms
 */
class DataEncrypterV4 {
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

  protected readonly aesKey: WordArray;
  protected readonly initializationVector: WordArray;

  constructor(encryptionKey: WordArray, reference: PDFRef) {
    this.aesKey = DataEncrypterV4.createAesKey(encryptionKey, reference);
    this.initializationVector = wordArrayRandom(16);
  }

  encryptData(data: Uint8Array): Uint8Array {
    const encryptedContent = encryptAES(
      wordArrayFromBytes(data),
      this.aesKey,
      this.initializationVector,
    );

    // Initialization vector should be stored as the first 16 bytes of the encrypted data.
    const encryptedResult = this.initializationVector
      .clone()
      .concat(encryptedContent);

    return wordArrayToBytes(encryptedResult);
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
