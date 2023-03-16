import type { PDFContext } from 'src/core/PDFContext';

export abstract class PDFObject {
  abstract clone(context?: PDFContext): PDFObject;

  abstract toString(): string;

  abstract sizeInBytes(): number;

  abstract copyBytesInto(buffer: Uint8Array, offset: number): number;
}
