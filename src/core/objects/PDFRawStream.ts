import type { ObjectEncrypter } from './ObjectEncrypter.js';
import type { PDFDict } from './PDFDict.js';
import type { PDFObject } from './PDFObject.js';
import type { PDFRef } from './PDFRef.js';
import { PDFStream } from './PDFStream.js';
import type { PDFContext } from '../PDFContext.js';
import { arrayAsString } from '../../utils/arrays.js';

export class PDFRawStream extends PDFStream {
  static of = (dict: PDFDict, contents: Uint8Array) =>
    new PDFRawStream(dict, contents);

  readonly contents: Uint8Array;

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

  getContents(): Uint8Array {
    return this.contents;
  }

  getContentsSize(): number {
    return this.contents.length;
  }

  encryptWith(encrypter: ObjectEncrypter, reference: PDFRef): PDFObject {
    return new PDFRawStream(
      this.dict.clone(),
      encrypter.encryptObjectContent(this.contents, reference),
    );
  }
}
