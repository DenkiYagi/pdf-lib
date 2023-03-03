// @ts-nocheck
// This file is for future implementations.

import saslprep from 'saslprep';

import {
  WordArray,
  GenerateRandomWordArrayFn,
  wordArrayToBuffer,
  lsbFirstWord,
} from 'src/core/security/WordArray';
import type { StdSecurityHandlerDictBase } from './StdSecurityHandler';

export interface StdSecurityHandlerDictR5 extends StdSecurityHandlerDictBase {
  /**
   * Owner encryption key.
   */
  OE: Uint8Array;

  /**
   * User encryption key.
   */
  UE: Uint8Array;

  /**
   * Permissions.
   */
  Perms: Uint8Array;
}

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

export const setupStdSecurityHandlerR5 = (
  ownerPassword: string,
): {
  key: WordArray;
  dict: StdSecurityHandlerDictR5;
} => {
  const processedOwnerPassword = processPasswordR5(ownerPassword);
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

  return {
    key: encryptionKey,
    dict: {
      R: 5,
      O: wordArrayToBuffer(ownerPasswordEntry),
      OE: wordArrayToBuffer(ownerEncryptionKeyEntry),
      U: wordArrayToBuffer(userPasswordEntry),
      UE: wordArrayToBuffer(userEncryptionKeyEntry),
      P: fullPermissions,
      Perms: wordArrayToBuffer(permsEntry),
    },
  };
};
