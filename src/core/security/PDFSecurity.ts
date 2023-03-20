import type { EncryptionKey } from 'src/core/security/Encryption';
import { prepareEncryptionStdV4 } from 'src/core/security/EncryptionStdV4';

/**
 * Security options to be provided as input for `PDFSecurity`.
 */
export interface SecurityOptions {
  /**
   * Password to open the PDF document to be encrypted.
   */
  password: string;
}

/*
 * Represents security of any PDF document.
 */
export class PDFSecurity {
  /**
   * Create a set of:
   * - `PDFSecurity` instance to be used for encrypting actual data.
   * - encryption dictionary to be written to the PDF file trailer.
   *
   * @param documentFirstId The first element of the PDF file identifier.
   * @param options Security options.
   */
  static create(documentFirstId: Uint8Array, options: SecurityOptions) {
    // We only support AES-128 with the encryption algorithm version 4.
    const encryption = prepareEncryptionStdV4(documentFirstId, 128, options);

    return {
      security: new PDFSecurity(encryption.key),
      encryptionDictionary: encryption.dictionary,
    };
  }

  /**
   * Provides encrypting function.
   */
  readonly encryptionKey: EncryptionKey;

  protected constructor(encryptionKey: EncryptionKey) {
    this.encryptionKey = encryptionKey;
  }
}
