import type { WordArray } from 'src/utils/crypt';

/**
 * Represents a standard security handler and provides
 * functions for computing several data for encryption.
 */
export abstract class StdSecurityHandler {
  /**
   * Bit length of the encryption key to be computed.
   */
  readonly keyBitLength: number;

  constructor(keyBitLength: number) {
    this.keyBitLength = keyBitLength;
  }

  abstract computeEncryptionKey(): WordArray;
  abstract createEncryptionDictEntries(): StdSecurityHandlerDict;
}

/**
 * Additional entries for encryption dictionaries that
 * should be assigned when using standard security handler.
 */
export interface StdSecurityHandlerDict {
  /**
   * Revision of the Standard Security Handler.
   */
  R: number;

  /**
   * Owner key.
   */
  O: Uint8Array;

  /**
   * User key.
   */
  U: Uint8Array;

  /**
   * Permission flags.
   */
  P: number;
}
