import type CryptoJS from 'crypto-js';

export type WordArray = CryptoJS.lib.WordArray;
export type GenerateRandomWordArrayFn = (bytes: number) => WordArray;

export const wordArrayToBuffer = (wordArray: WordArray): Uint8Array => {
  const byteArray = [];
  for (let i = 0; i < wordArray.sigBytes; i++) {
    byteArray.push(
      (wordArray.words[Math.floor(i / 4)] >> (8 * (3 - (i % 4)))) & 0xff,
    );
  }

  return Uint8Array.from(byteArray);
};

export const lsbFirstWord = (data: number): number =>
  ((data & 0xff) << 24) |
  ((data & 0xff00) << 8) |
  ((data >> 8) & 0xff00) |
  ((data >> 24) & 0xff);
