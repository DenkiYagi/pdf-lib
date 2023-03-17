import type { PDFContext } from 'src/core/PDFContext';
import type { Encrypter } from 'src/core/objects/Encrypter';

export abstract class PDFObject {
  abstract clone(context?: PDFContext): PDFObject;

  abstract toString(): string;

  abstract sizeInBytes(): number;

  abstract copyBytesInto(buffer: Uint8Array, offset: number): number;

  /**
   * Encrypt this object and returns the result as a new `PDFObject`,
   * or returns `null` if `this` can't be encrypted.
   */
  encryptWith(_encrypter: Encrypter): PDFObject | null {
    return null;
  }
}
