import type { ObjectEncrypter } from 'src/core/objects/ObjectEncrypter.js';
import type { PDFDict } from 'src/core/objects/PDFDict.js';
import type { PDFObject } from 'src/core/objects/PDFObject.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';
import { PDFStream } from 'src/core/objects/PDFStream.js';
import type { PDFContext } from 'src/core/PDFContext.js';
import { arrayAsString } from 'src/utils/arrays.js';

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
