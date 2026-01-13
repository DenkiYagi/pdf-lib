import type { PDFContext } from '../PDFContext.js';
import type { ObjectEncrypter } from './ObjectEncrypter.js';
import type { PDFRef } from './PDFRef.js';

export abstract class PDFObject {
  abstract clone(context?: PDFContext): PDFObject;

  abstract toString(): string;

  abstract sizeInBytes(): number;

  abstract copyBytesInto(buffer: Uint8Array, offset: number): number;

  /**
   * Encrypt this object and returns the result as a new `PDFObject`,
   * or returns `null` if `this` can't be encrypted.
   */
  encryptWith(
    _encrypter: ObjectEncrypter,
    _reference: PDFRef,
  ): PDFObject | null {
    return null;
  }
}
