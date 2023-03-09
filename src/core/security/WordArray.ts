import type CryptoJS from 'crypto-js';

/**
 * An array of 32-bit words.
 */
export type WordArray = CryptoJS.lib.WordArray;

/**
 * Convert `WordArray` to `Uint8Array`.
 */
export const wordsToBytes = (wordArray: WordArray): Uint8Array => {
  const bytes: Array<number> = [];
  const { sigBytes, words } = wordArray;

  for (let byteIndex = 0; byteIndex < sigBytes; ++byteIndex) {
    const word = words[Math.floor(byteIndex / 4)];
    const bitShift = 8 * (3 - (byteIndex % 4));
    bytes.push((word >>> bitShift) & 0xff);
  }

  return Uint8Array.from(bytes);
};
