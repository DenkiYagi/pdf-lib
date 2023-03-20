import type { ObjectEncrypter } from 'src/core/objects/ObjectEncrypter';
import { PDFObject } from 'src/core/objects/PDFObject';
import type { PDFRef } from 'src/core/objects/PDFRef';
import { CharCodes } from 'src/core/syntax/CharCodes';
import {
  copyStringIntoBuffer,
  toHexStringOfMinLength,
  utf16Decode,
  utf16Encode,
  pdfDocEncodingDecode,
  parseDate,
  hasUtf16BOM,
  uint8ArrayToHex,
} from 'src/utils';
import { InvalidPDFDateStringError } from 'src/core/errors';

export class PDFHexString extends PDFObject {
  static of = (value: string, preventEncryption?: boolean) =>
    new PDFHexString(value, preventEncryption);

  static fromText = (value: string, preventEncryption?: boolean) => {
    const encoded = utf16Encode(value);

    let hex = '';
    for (let idx = 0, len = encoded.length; idx < len; idx++) {
      hex += toHexStringOfMinLength(encoded[idx], 4);
    }

    return new PDFHexString(hex, preventEncryption);
  };

  static fromUint8Array = (data: Uint8Array, preventEncryption?: boolean) =>
    new PDFHexString(uint8ArrayToHex(data), preventEncryption);

  private readonly value: string;
  private readonly preventEncryption: boolean;

  constructor(value: string, preventEncryption = false) {
    super();
    this.value = value;
    this.preventEncryption = preventEncryption;
  }

  asBytes(): Uint8Array {
    // Append a zero if the number of digits is odd. See PDF spec 7.3.4.3
    const hex = this.value + (this.value.length % 2 === 1 ? '0' : '');
    const hexLength = hex.length;

    const bytes = new Uint8Array(hex.length / 2);

    let hexOffset = 0;
    let bytesOffset = 0;

    // Interpret each pair of hex digits as a single byte
    while (hexOffset < hexLength) {
      const byte = parseInt(hex.substring(hexOffset, hexOffset + 2), 16);
      bytes[bytesOffset] = byte;

      hexOffset += 2;
      bytesOffset += 1;
    }

    return bytes;
  }

  decodeText(): string {
    const bytes = this.asBytes();
    if (hasUtf16BOM(bytes)) return utf16Decode(bytes);
    return pdfDocEncodingDecode(bytes);
  }

  decodeDate(): Date {
    const text = this.decodeText();
    const date = parseDate(text);
    if (!date) throw new InvalidPDFDateStringError(text);
    return date;
  }

  asString(): string {
    return this.value;
  }

  clone(): PDFHexString {
    return PDFHexString.of(this.value);
  }

  toString(): string {
    return `<${this.value}>`;
  }

  sizeInBytes(): number {
    return this.value.length + 2;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.LessThan;
    offset += copyStringIntoBuffer(this.value, buffer, offset);
    buffer[offset++] = CharCodes.GreaterThan;
    return this.value.length + 2;
  }

  encryptWith(encrypter: ObjectEncrypter, reference: PDFRef): PDFObject | null {
    if (this.preventEncryption) return null;

    const buffer = this.asBytes();
    const encrypted = encrypter.encryptObjectContent(buffer, reference);

    return PDFHexString.fromUint8Array(encrypted);
  }
}
