import { MD5, wordArrayToBytes } from 'src/utils/crypt';

/*
 * Generate MD5 hash bytes from any arbitrary string.
 */
export function getHashBytesMD5(s: string): Uint8Array {
  return wordArrayToBytes(MD5(s));
}
