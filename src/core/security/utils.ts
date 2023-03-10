import CryptoJS from 'crypto-js';
import { wordArrayToBytes } from './WordArray';

/*
 * Generate MD5 hash bytes from any arbitrary string.
 */
export function getHashBytesMD5(s: string): Uint8Array {
  return wordArrayToBytes(CryptoJS.MD5(s));
}
