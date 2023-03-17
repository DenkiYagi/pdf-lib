import pako from 'pako';

import type { PDFDict } from 'src/core/objects/PDFDict';
import { PDFName } from 'src/core/objects/PDFName';
import { PDFStream } from 'src/core/objects/PDFStream';
import type { Encrypter } from 'src/core/objects/Encrypter';
import { Cache } from 'src/utils';

export abstract class PDFFlateStream extends PDFStream {
  protected readonly contentsCache: Cache<Uint8Array>;
  protected readonly encode: boolean;

  constructor(dict: PDFDict, encode: boolean, encrypter: Encrypter | null) {
    super(dict);

    this.encode = encode;
    if (encode) dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
    this.contentsCache = Cache.populatedBy(
      this.computeContents.bind(this, encrypter),
    );
  }

  getContents(): Uint8Array {
    return this.contentsCache.access();
  }

  getContentsSize(): number {
    return this.contentsCache.access().length;
  }

  abstract getUnencodedContents(): Uint8Array;

  private computeContents = (encrypter: Encrypter | null): Uint8Array => {
    const unencodedContents = this.getUnencodedContents();
    const encodedContents = this.encode
      ? pako.deflate(unencodedContents)
      : unencodedContents;

    if (encrypter == null) return encodedContents;
    else return encrypter.encryptData(encodedContents);
  };
}
