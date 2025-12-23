import { PDFObject } from 'src/core/objects/PDFObject.js';
import { CharCodes } from 'src/core/syntax/CharCodes.js';

class PDFNullObject extends PDFObject {
  asNull(): null {
    return null;
  }

  clone(): PDFNullObject {
    return this;
  }

  toString(): string {
    return 'null';
  }

  sizeInBytes(): number {
    return 4;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.n;
    buffer[offset++] = CharCodes.u;
    buffer[offset++] = CharCodes.l;
    buffer[offset++] = CharCodes.l;
    return 4;
  }
}

export const PDFNull = new PDFNullObject();
