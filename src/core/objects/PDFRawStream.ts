import type { PDFDict } from 'src/core/objects/PDFDict';
import { PDFStream } from 'src/core/objects/PDFStream';
import type { PDFContext } from 'src/core/PDFContext';
import { arrayAsString } from 'src/utils';

export class PDFRawStream extends PDFStream {
  static of = (dict: PDFDict, contents: Uint8Array) =>
    new PDFRawStream(dict, contents);

  contents: Uint8Array;

  private constructor(dict: PDFDict, contents: Uint8Array) {
    super(dict);
    this.contents = contents;
  }

  asUint8Array(): Uint8Array {
    return this.contents.slice();
  }

  clone(context?: PDFContext): PDFRawStream {
    return PDFRawStream.of(this.dict.clone(context), this.contents.slice());
  }

  getContentsString(): string {
    return arrayAsString(this.contents);
  }

  updateContent(encrypt: Uint8Array): void {
    this.contents = encrypt;
  }

  getContents(): Uint8Array {
    return this.contents;
  }

  getContentsSize(): number {
    return this.contents.length;
  }
}
