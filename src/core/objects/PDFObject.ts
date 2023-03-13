import type { PDFContext } from 'src/core/PDFContext';

export abstract class PDFObject {
  abstract clone(context?: PDFContext): PDFObject;

  abstract toString(): string;

  abstract sizeInBytes(): number;

  abstract copyBytesInto(_buffer: Uint8Array, _offset: number): number;
}
