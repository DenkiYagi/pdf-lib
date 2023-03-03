import CryptoJS from 'crypto-js';
import type {
  EncDictV,
  EncDictV4,
  EncKeyBits,
  Encryption,
} from 'src/core/security/Encryption';
import type { SecurityOptions } from 'src/core/security/PDFSecurity';
import type { WordArray } from 'src/core/security/WordArray';
import { wordArrayToBuffer, lsbFirstWord } from 'src/core/security/WordArray';

/**
 * Permission Flag for use Encryption Dictionary (Key: P)
 * For Security Handler revision 3 or higher
 */
const fullPermissions = 0xfffff0c0 >> 0;

const getUserPasswordR4 = (
  firstId: Uint8Array,
  encryptionKey: WordArray,
) => {
  const key = encryptionKey.clone();
  let cipher = CryptoJS.MD5(
    processPasswordR4().concat(
      CryptoJS.lib.WordArray.create(firstId as unknown as number[]),
    ),
  );
  for (let i = 0; i < 20; i++) {
    const xorRound = Math.ceil(key.sigBytes / 4);
    for (let j = 0; j < xorRound; j++) {
      key.words[j] =
        encryptionKey.words[j] ^ (i | (i << 8) | (i << 16) | (i << 24));
    }
    cipher = CryptoJS.RC4.encrypt(cipher, key).ciphertext;
  }
  return cipher.concat(
    CryptoJS.lib.WordArray.create(null as unknown as undefined, 16),
  );
};

const getOwnerPasswordR4 = (
  keyBits: EncKeyBits,
  paddedUserPassword: WordArray,
  paddedOwnerPassword: WordArray,
): CryptoJS.lib.WordArray => {
  let digest = paddedOwnerPassword;
  let round = 51;
  for (let i = 0; i < round; i++) {
    digest = CryptoJS.MD5(digest);
  }

  const key = digest.clone();
  key.sigBytes = keyBits / 8;
  let cipher = paddedUserPassword;
  round = 20;
  for (let i = 0; i < round; i++) {
    const xorRound = Math.ceil(key.sigBytes / 4);
    for (let j = 0; j < xorRound; j++) {
      key.words[j] = digest.words[j] ^ (i | (i << 8) | (i << 16) | (i << 24));
    }
    cipher = CryptoJS.RC4.encrypt(cipher, key).ciphertext;
  }
  return cipher;
};

const getEncryptionKeyR4 = (
  keyBits: EncKeyBits,
  firstId: Uint8Array,
  paddedUserPassword: WordArray,
  ownerPasswordEntry: WordArray,
  permissions: number,
): WordArray => {
  let key = paddedUserPassword
    .clone()
    .concat(ownerPasswordEntry)
    .concat(CryptoJS.lib.WordArray.create([lsbFirstWord(permissions)], 4))
    .concat(CryptoJS.lib.WordArray.create(firstId as unknown as number[]));
  const round = 51;
  for (let i = 0; i < round; i++) {
    key = CryptoJS.MD5(key);
    key.sigBytes = keyBits / 8;
  }
  return key;
};

const processPasswordR4 = (password = '') => {
  const out = Buffer.alloc(32);
  const length = password.length;
  let index = 0;
  while (index < length && index < 32) {
    const code = password.charCodeAt(index);
    if (code > 0xff) {
      throw new Error('Password contains one or more invalid characters.');
    }
    out[index] = code;
    index++;
  }
  while (index < 32) {
    out[index] = PASSWORD_PADDING[index - length];
    index++;
  }
  return CryptoJS.lib.WordArray.create(out as unknown as number[]);
};

/* 
  7.6.3.3 Encryption Key Algorithm
  Algorithm 2
  Password Padding to pad or truncate
  the password to exactly 32 bytes
*/
const PASSWORD_PADDING = [
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff,
  0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c,
  0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
];

export const setupEncryptionR4 = (
  version: EncDictV,
  firstId: Uint8Array,
  options: SecurityOptions,
): Encryption => {
  const dictionary = {
    Filter: 'Standard',
  } as EncDictV4;

  const keyBits: EncKeyBits = 128;

  const paddedOwnerPassword: WordArray = processPasswordR4(
    options.ownerPassword,
  );
  const paddedUserPassword = paddedOwnerPassword.clone();

  const ownerPasswordEntry: WordArray = getOwnerPasswordR4(
    keyBits,
    paddedUserPassword,
    paddedOwnerPassword,
  );
  const encryptionKey = getEncryptionKeyR4(
    keyBits,
    firstId,
    paddedUserPassword,
    ownerPasswordEntry,
    fullPermissions,
  );
  const userPasswordEntry = getUserPasswordR4(firstId, encryptionKey);

  dictionary.V = version;
  dictionary.CF = {
    StdCF: {
      AuthEvent: 'DocOpen',
      CFM: 'AESV2',
    },
  };
  dictionary.StmF = 'StdCF';
  dictionary.StrF = 'StdCF';

  dictionary.R = 4;
  dictionary.O = wordArrayToBuffer(ownerPasswordEntry);
  dictionary.U = wordArrayToBuffer(userPasswordEntry);
  dictionary.P = fullPermissions;

  return {
    keyBits,
    key: encryptionKey,
    dictionary,
  };
};
