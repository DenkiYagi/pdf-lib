import CryptoJS from 'crypto-js';
import { wordArrayFromBytes } from 'src/utils/crypt';

const randomBk = CryptoJS.lib.WordArray.random.bind(undefined);

/**
 * Mock `WordArray.random()` (which is used in the core encryption process)
 * so that it always returns consistent values during the test.
 * Remember to call `resetMock()` as soon as the mock is no longer needed.
 */
export const mockRandom = (fillValue: number) => {
  CryptoJS.lib.WordArray.random = (nBytes) =>
    wordArrayFromBytes(new Uint8Array(nBytes).fill(fillValue));
};

/**
 * Reset the effect of `mockRandom()`.
 */
export const resetMock = () => {
  CryptoJS.lib.WordArray.random = randomBk;
};
