import CryptoJS from 'crypto-js';

/**
 * An array of 32-bit words.
 */
export type WordArray = CryptoJS.lib.WordArray;

type Message = string | WordArray;

export const MD5 = (message: Message): WordArray => CryptoJS.MD5(message);

export const encryptRC4 = (message: Message, key: Message): WordArray =>
  CryptoJS.RC4.encrypt(message, key).ciphertext;

export const encryptAES = (
  message: Message,
  key: Message,
  initializationVector: WordArray,
): WordArray =>
  CryptoJS.AES.encrypt(message, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: initializationVector,
  }).ciphertext;

/**
 * Create a new `WordArray`.
 */
export const createWordArray = (
  words: number[],
  byteLength?: number,
): WordArray => CryptoJS.lib.WordArray.create(words, byteLength);

/**
 * Convert `Uint8Array` to `WordArray`.
 */
export const wordArrayFromBytes = (
  bytes: Uint8Array,
  byteLength?: number,
): WordArray =>
  CryptoJS.lib.WordArray.create(
    bytes as unknown as number[],
    byteLength ?? bytes.length,
  );

/**
 * Convert `WordArray` to `Uint8Array`.
 */
export const wordArrayToBytes = (wordArray: WordArray): Uint8Array => {
  const bytes: number[] = [];
  const { sigBytes, words } = wordArray;

  for (let byteIndex = 0; byteIndex < sigBytes; ++byteIndex) {
    const word = words[Math.floor(byteIndex / 4)];
    const bitShift = 8 * (3 - (byteIndex % 4));
    bytes.push((word >>> bitShift) & 0xff);
  }

  return Uint8Array.from(bytes);
};

/**
 * Create a new `WordArray` with N random bytes.
 */
export const wordArrayRandom = (byteLength: number): WordArray =>
  CryptoJS.lib.WordArray.random(byteLength);
