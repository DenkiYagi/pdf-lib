import type { PDFRef } from 'src/core/objects/PDFRef';
import {
  Encryption,
  EncryptionKey,
  EncryptionDictStd,
} from 'src/core/security/Encryption';
import type { SecurityOptions } from 'src/core/security/PDFSecurity';
import { StdSecurityHandlerR4 } from 'src/core/security/StdSecurityHandlerR4';
import { DataEncrypterV4 } from 'src/core/security/DataEncrypterV4';

/**
 * Subtype of `EncryptionKey` to be used when using encryption algorithm version 4.
 */
export class EncryptionKeyV4 extends EncryptionKey {
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
 * Prepare for encryption using standard security handler and encryption algorithm version 4.
 */
export const prepareEncryptionStdV4 = (
  documentFirstId: Uint8Array,
  keyBitLength: number,
  options: SecurityOptions,
): Encryption => {
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
};
