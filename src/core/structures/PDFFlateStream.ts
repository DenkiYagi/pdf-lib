import pako from 'pako';

import type { PDFDict } from 'src/core/objects/PDFDict.js';
import { PDFName } from 'src/core/objects/PDFName.js';
import { PDFStream } from 'src/core/objects/PDFStream.js';
import type { ObjectEncrypter } from 'src/core/objects/ObjectEncrypter.js';
import { Cache } from 'src/utils/Cache.js';
import type { PDFRef } from '../objects/PDFRef.js';

export type PDFFlateStreamEncryptionParams = {
  readonly encrypter: ObjectEncrypter;
  readonly reference: PDFRef;
};

export abstract class PDFFlateStream extends PDFStream {
  protected readonly contentsCache: Cache<Uint8Array>;
  protected readonly encode: boolean;

  constructor(
    dict: PDFDict,
    encode: boolean,
    encryption: PDFFlateStreamEncryptionParams | null,
  ) {
    super(dict);

    this.encode = encode;
    if (encode) dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
    this.contentsCache = Cache.populatedBy(
      this.computeContents.bind(this, encryption),
    );
  }

  getContents(): Uint8Array {
    return this.contentsCache.access();
  }

  getContentsSize(): number {
    return this.contentsCache.access().length;
  }

  abstract getUnencodedContents(): Uint8Array;

  private computeContents = (
    encryption: PDFFlateStreamEncryptionParams | null,
  ): Uint8Array => {
    const unencodedContents = this.getUnencodedContents();
    const encodedContents = this.encode
      ? pako.deflate(unencodedContents)
      : unencodedContents;

    if (encryption == null) {
      return encodedContents;
    } else {
      return encryption.encrypter.encryptObjectContent(
        encodedContents,
        encryption.reference,
      );
    }
  };
}
