import pako from 'pako';

import type { PDFDict } from 'src/core/objects/PDFDict';
import { PDFName } from 'src/core/objects/PDFName';
import { PDFStream } from 'src/core/objects/PDFStream';
import { Cache } from 'src/utils';

export abstract class PDFFlateStream extends PDFStream {
  protected readonly contentsCache: Cache<Uint8Array>;
  protected readonly encode: boolean;

  constructor(dict: PDFDict, encode: boolean) {
    super(dict);

    this.encode = encode;

    if (encode) dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
    this.contentsCache = Cache.populatedBy(this.computeContents);
  }

  getContents(): Uint8Array {
    return this.contentsCache.access();
  }

  getContentsSize(): number {
    return this.contentsCache.access().length;
  }
  
  computeContents = (): Uint8Array => {
    const unencodedContents = this.getUnencodedContents();
    return this.encode ? pako.deflate(unencodedContents) : unencodedContents;
  };

  abstract getUnencodedContents(): Uint8Array;
}
