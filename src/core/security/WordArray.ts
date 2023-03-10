import CryptoJS from 'crypto-js';

/**
 * An array of 32-bit words.
 */
export type WordArray = CryptoJS.lib.WordArray;

/**
 * Creates a new `WordArray`.
 */
export function wordArray(words: number[], byteLength?: number): WordArray {
  return CryptoJS.lib.WordArray.create(words, byteLength);
}

/**
 * Convert `Uint8Array` to `WordArray`.
 */
export function wordArrayFromBytes(
  bytes: Uint8Array,
  byteLength?: number,
): WordArray {
  return CryptoJS.lib.WordArray.create(
    bytes as unknown as number[],
    byteLength ?? bytes.length,
  );
}

/**
 * Convert `WordArray` to `Uint8Array`.
 */
export function wordArrayToBytes(wordArray: WordArray): Uint8Array {
  const bytes: Array<number> = [];
  const { sigBytes, words } = wordArray;

  for (let byteIndex = 0; byteIndex < sigBytes; ++byteIndex) {
    const word = words[Math.floor(byteIndex / 4)];
    const bitShift = 8 * (3 - (byteIndex % 4));
    bytes.push((word >>> bitShift) & 0xff);
  }

  return Uint8Array.from(bytes);
}

/**
 * Create a new `WordArray` with N random bytes.
 */
export function wordArrayRandom(byteLength: number): WordArray {
  return CryptoJS.lib.WordArray.random(byteLength);
}
