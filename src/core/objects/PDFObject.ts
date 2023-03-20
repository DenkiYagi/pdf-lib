import type { PDFContext } from 'src/core/PDFContext';
import type { ObjectEncrypter } from 'src/core/objects/ObjectEncrypter';
import type { PDFRef } from 'src/core/objects/PDFRef';

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
