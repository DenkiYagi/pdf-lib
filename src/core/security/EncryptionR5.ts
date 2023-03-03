import saslprep from 'saslprep';

import type {
  EncDictV5,
  EncKeyBits,
  Encryption,
} from 'src/core/security/Encryption';
import type { SecurityOptions } from 'src/core/security/PDFSecurity';
import type { WordArray } from 'src/core/security/WordArray';
import {
  GenerateRandomWordArrayFn,
  wordArrayToBuffer,
  lsbFirstWord,
} from 'src/core/security/WordArray';

/**
 * Permission Flag for use Encryption Dictionary (Key: P)
 * For Security Handler revision 3 or higher
 */
const fullPermissions = 0xfffff0c0 >> 0;

const getUserPasswordR5 = (
  processedUserPassword: WordArray,
  generateRandomWordArray: GenerateRandomWordArrayFn,
) => {
  const validationSalt = generateRandomWordArray(8);
  const keySalt = generateRandomWordArray(8);
  return CryptoJS.SHA256(processedUserPassword.clone().concat(validationSalt))
    .concat(validationSalt)
    .concat(keySalt);
};

const getUserEncryptionKeyR5 = (
  processedUserPassword: WordArray,
  userKeySalt: WordArray,
  encryptionKey: WordArray,
) => {
  const key = CryptoJS.SHA256(
    processedUserPassword.clone().concat(userKeySalt),
  );
  const options = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: CryptoJS.lib.WordArray.create(null as unknown as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
};

const getOwnerPasswordR5 = (
  processedOwnerPassword: WordArray,
  userPasswordEntry: WordArray,
  generateRandomWordArray: GenerateRandomWordArrayFn,
) => {
  const validationSalt = generateRandomWordArray(8);
  const keySalt = generateRandomWordArray(8);
  return CryptoJS.SHA256(
    processedOwnerPassword
      .clone()
      .concat(validationSalt)
      .concat(userPasswordEntry),
  )
    .concat(validationSalt)
    .concat(keySalt);
};

const getOwnerEncryptionKeyR5 = (
  processedOwnerPassword: WordArray,
  ownerKeySalt: WordArray,
  userPasswordEntry: WordArray,
  encryptionKey: WordArray,
) => {
  const key = CryptoJS.SHA256(
    processedOwnerPassword
      .clone()
      .concat(ownerKeySalt)
      .concat(userPasswordEntry),
  );
  const options = {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: CryptoJS.lib.WordArray.create(null as unknown as undefined, 16),
  };
  return CryptoJS.AES.encrypt(encryptionKey, key, options).ciphertext;
};

const getEncryptionKeyR5 = (
  generateRandomWordArray: GenerateRandomWordArrayFn,
) => generateRandomWordArray(32);

const getEncryptedPermissionsR5 = (
  permissions: number,
  encryptionKey: WordArray,
  generateRandomWordArray: GenerateRandomWordArrayFn,
) => {
  const cipher = CryptoJS.lib.WordArray.create(
    [lsbFirstWord(permissions), 0xffffffff, 0x54616462],
    12,
  ).concat(generateRandomWordArray(4));
  const options = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  };
  return CryptoJS.AES.encrypt(cipher, encryptionKey, options).ciphertext;
};

const processPasswordR5 = (password = '') => {
  password = unescape(encodeURIComponent(saslprep(password)));
  const length = Math.min(127, password.length);
  const out = Buffer.alloc(length);

  for (let i = 0; i < length; i++) {
    out[i] = password.charCodeAt(i);
  }

  return CryptoJS.lib.WordArray.create(out as unknown as number[]);
};

export const setupEncryptionR5 = (options: SecurityOptions): Encryption => {
  const dictionary = {
    Filter: 'Standard',
  } as EncDictV5;

  const keyBits: EncKeyBits = 256;

  const processedOwnerPassword = processPasswordR5(options.ownerPassword);
  const processedUserPassword = processedOwnerPassword.clone();

  const encryptionKey = getEncryptionKeyR5(CryptoJS.lib.WordArray.random);
  const userPasswordEntry = getUserPasswordR5(
    processedUserPassword,
    CryptoJS.lib.WordArray.random,
  );
  const userKeySalt = CryptoJS.lib.WordArray.create(
    userPasswordEntry.words.slice(10, 12),
    8,
  );
  const userEncryptionKeyEntry = getUserEncryptionKeyR5(
    processedUserPassword,
    userKeySalt,
    encryptionKey,
  );
  const ownerPasswordEntry = getOwnerPasswordR5(
    processedOwnerPassword,
    userPasswordEntry,
    CryptoJS.lib.WordArray.random,
  );
  const ownerKeySalt = CryptoJS.lib.WordArray.create(
    ownerPasswordEntry.words.slice(10, 12),
    8,
  );
  const ownerEncryptionKeyEntry = getOwnerEncryptionKeyR5(
    processedOwnerPassword,
    ownerKeySalt,
    userPasswordEntry,
    encryptionKey,
  );
  const permsEntry = getEncryptedPermissionsR5(
    fullPermissions,
    encryptionKey,
    CryptoJS.lib.WordArray.random,
  );

  dictionary.V = 5;
  dictionary.CF = {
    StdCF: {
      AuthEvent: 'DocOpen',
      CFM: 'AESV3',
    },
  };
  dictionary.StmF = 'StdCF';
  dictionary.StrF = 'StdCF';
  dictionary.R = 5;
  dictionary.O = wordArrayToBuffer(ownerPasswordEntry);
  dictionary.OE = wordArrayToBuffer(ownerEncryptionKeyEntry);
  dictionary.U = wordArrayToBuffer(userPasswordEntry);
  dictionary.UE = wordArrayToBuffer(userEncryptionKeyEntry);
  dictionary.P = fullPermissions;
  dictionary.Perms = wordArrayToBuffer(permsEntry);

  return {
    keyBits,
    key: encryptionKey,
    dictionary,
  };
};
