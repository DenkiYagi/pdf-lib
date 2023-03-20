import {
  StdSecurityHandler,
  StdSecurityHandlerDict,
} from 'src/core/security/StdSecurityHandler';
import {
  MD5,
  encryptRC4,
  createWordArray,
  WordArray,
  wordArrayFromBytes,
  wordArrayToBytes,
} from 'src/utils/crypt';

/**
 * Standard security handler, revision 4.
 */
export class StdSecurityHandlerR4 extends StdSecurityHandler {
  /**
   * The first element of the `ID` array in the PDF file trailer.
   */
  protected readonly documentFirstId: WordArray;

  /**
   * Owner password (exactly 32 bytes) before being computed.
   */
  protected readonly ownerPassword: WordArray;

  /**
   * User password (exactly 32 bytes) before being computed.
   */
  protected readonly userPassword: WordArray;

  /**
   * Bit flags representing permission options,
   * which is always `0` since we do not support permissions.
   */
  protected readonly permissionFlags = 0;

  private readonly cache: {
    encryptionKey: WordArray | null;
    ownerPasswordComputed: WordArray | null;
    userPasswordComputed: WordArray | null;
  };

  constructor(params: {
    /**
     * The first element of the `ID` array in the PDF file trailer.
     */
    documentFirstId: Uint8Array;

    /**
     * Bit length of the encryption key.
     */
    keyBitLength: number;

    /**
     * Password string, which will be used for both owner and user passwords.
     */
    password: string;
  }) {
    super(params.keyBitLength);

    this.documentFirstId = createWordArray(
      params.documentFirstId as unknown as number[],
    );

    this.userPassword = padOrTruncate32(params.password);
    this.ownerPassword = this.userPassword.clone();

    this.cache = {
      encryptionKey: null,
      ownerPasswordComputed: null,
      userPasswordComputed: null,
    };
  }

  /**
   * Compute an encryption key.
   *
   * @see ISO 32000-1 > 7.6.3.3 Encryption Key Algorithm > Algorithm 2: Computing an encryption key
   */
  computeEncryptionKey(): WordArray {
    if (this.cache.encryptionKey != null) return this.cache.encryptionKey;

    let key = this.userPassword
      .clone()
      .concat(this.computeOwnerPassword())
      .concat(createWordArray([this.permissionFlags], 4))
      .concat(this.documentFirstId);
    // NOTE: If document metadata is not being encrypted,
    //   concat additional 4 bytes with the value 0xFFFFFFFF (not supported for now).

    const keyByteLength = this.keyBitLength / 8;
    for (let i = 0; i < 51; ++i) {
      key = MD5(key);
      key.sigBytes = keyByteLength;
    }

    return (this.cache.encryptionKey = key);
  }

  /**
   * Create entries to be assigned to the encryption dictionary.
   */
  createEncryptionDictEntries(): StdSecurityHandlerDict {
    return {
      R: 4,
      O: wordArrayToBytes(this.computeOwnerPassword()),
      U: wordArrayToBytes(this.computeUserPassword()),
      P: this.permissionFlags,
    };
  }

  /**
   * Compute the `O` value to be assigned to the encryption dictionary.
   *
   * @see ISO 32000-1 > 7.6.3.3 Encryption Key Algorithm > Algorithm 3:
   *   Computing the encryption dictionary’s O (owner password) value
   */
  protected computeOwnerPassword(): WordArray {
    if (this.cache.ownerPasswordComputed != null) {
      return this.cache.ownerPasswordComputed;
    }

    let md = this.ownerPassword;
    for (let i = 0; i < 51; ++i) md = MD5(md);

    const rc4KeyOriginal = md;
    rc4KeyOriginal.sigBytes = this.keyBitLength / 8;
    const rc4KeyWordCount = Math.ceil(rc4KeyOriginal.sigBytes / 4);
    const rc4KeyCurrent = rc4KeyOriginal.clone();

    let rc4Out = this.userPassword;
    for (let i = 0; i < 20; ++i) {
      const xorMask = i | (i << 8) | (i << 16) | (i << 24);
      for (let wi = 0; wi < rc4KeyWordCount; ++wi) {
        rc4KeyCurrent.words[wi] = rc4KeyOriginal.words[wi] ^ xorMask;
      }
      rc4Out = encryptRC4(rc4Out, rc4KeyCurrent);
    }

    return (this.cache.ownerPasswordComputed = rc4Out);
  }

  /**
   * Compute the `U` value to be assigned to the encryption dictionary.
   *
   * @see ISO 32000-1 > 7.6.3.3 Encryption Key Algorithm > Algorithm 5:
   *   Computing the encryption dictionary’s U (user password) value
   *   (Security handlers of revision 3 or greater)
   */
  protected computeUserPassword() {
    if (this.cache.userPasswordComputed != null) {
      return this.cache.userPasswordComputed;
    }

    const rc4KeyOriginal = this.computeEncryptionKey();
    const rc4KeyWordCount = Math.ceil(rc4KeyOriginal.sigBytes / 4);
    const rc4KeyCurrent = rc4KeyOriginal.clone();

    const padding32 = wordArrayFromBytes(standardPaddingBytes);
    let rc4Out = MD5(padding32.clone().concat(this.documentFirstId));
    for (let i = 0; i < 20; ++i) {
      const xorMask = i | (i << 8) | (i << 16) | (i << 24);
      for (let wi = 0; wi < rc4KeyWordCount; ++wi) {
        rc4KeyCurrent.words[wi] = rc4KeyOriginal.words[wi] ^ xorMask;
      }
      rc4Out = encryptRC4(rc4Out, rc4KeyCurrent);
    }
    rc4Out.sigBytes = 16;

    const padding16 = wordArrayFromBytes(standardPaddingBytes, 16);
    const result = rc4Out.concat(padding16);

    return (this.cache.userPasswordComputed = result);
  }
}

/**
 * Matches if all characters are Latin-1.
 */
const latin1Only = /^[\u0020-\u007e\u00a0-\u00ff]*$/;

/**
 * 32-bytes string of the standard padding used by the standard security handler.
 *
 * @see ISO 32000-1 > 7.6.3.3 Encryption Key Algorithm > Algorithm 2: Computing an encryption key
 */
const standardPaddingBytes = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff,
  0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c,
  0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

/**
 * Pad or truncate a given string to 32 bytes and convert it to `WordArray`.
 *
 * Throws error if the string contains any character that is not Latin-1.
 *
 * @see ISO 32000-1 > 7.6.3.3 Encryption Key Algorithm > Algorithm 2: Computing an encryption key
 */
const padOrTruncate32 = (s: string): WordArray => {
  if (!latin1Only.test(s)) {
    throw new Error(`Password contains invalid characters.`);
  }

  const significantLength = Math.min(s.length, 32);
  const bytes = new Uint8Array(32);

  let index = 0;
  while (index < significantLength) {
    bytes[index] = s.charCodeAt(index);
    ++index;
  }
  let padIndex = 0;
  while (index < 32) {
    bytes[index] = standardPaddingBytes[padIndex];
    ++index;
    ++padIndex;
  }

  return wordArrayFromBytes(bytes);
};
