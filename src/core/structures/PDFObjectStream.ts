import { PDFInvalidObject } from 'src/core/objects/PDFInvalidObject';
import { PDFName } from 'src/core/objects/PDFName';
import { PDFNumber } from 'src/core/objects/PDFNumber';
import type { PDFObject } from 'src/core/objects/PDFObject';
import type { PDFRef } from 'src/core/objects/PDFRef';
import { PDFStream } from 'src/core/objects/PDFStream';
import type { ObjectEncrypter } from 'src/core/objects/ObjectEncrypter';
import type { PDFContext } from 'src/core/PDFContext';
import {
  PDFFlateStream,
  PDFFlateStreamEncryptionParams,
} from 'src/core/structures/PDFFlateStream';
import { CharCodes } from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer, last } from 'src/utils';

export type IndirectObject = [PDFRef, PDFObject];

export class PDFObjectStream extends PDFFlateStream {
  /**
   * Returns `true` if `indirectObject` shall not be stored in an object stream
   * (see ISO 32000-1 > 7.5.7. Object streams).
   *
   * Additional remarks:
   * - According to the implementation of PDFBox, the `Root` shall also not be stored
   *   in an object stream if you're going to encrypt the PDF document;
   *   otherwise you won't be able to open the encrypted PDF with Adobe Acrobat Reader.
   * - The value of `Length` entry in an object stream shall not be stored in another
   *   object stream. However in our implementation the `Length` entry of a stream is
   *   always a direct object, so it will never appear here.
   * - In linearized files, some other objects shall also not be stored in an object stream.
   *   However we don't support linearization for now.
   */
  static shallNotStore = (
    indirectObject: IndirectObject,
    context: PDFContext,
  ): boolean => {
    const [ref, obj] = indirectObject;
    const { trailerInfo } = context;

    if (trailerInfo.Encrypt != null) {
      if (ref === trailerInfo.Encrypt || ref === trailerInfo.Root) return true;
    }
    if (ref.generationNumber !== 0) return true;
    if (obj instanceof PDFStream) return true;
    if (obj instanceof PDFInvalidObject) return true;

    return false;
  };

  static withContextAndObjects = (
    context: PDFContext,
    objects: IndirectObject[],
    encode = true,
  ) => new PDFObjectStream(context, objects, encode, null);

  private readonly context: PDFContext;
  private readonly objects: IndirectObject[];
  private readonly offsets: [number, number][];
  private readonly offsetsString: string;

  private constructor(
    context: PDFContext,
    objects: IndirectObject[],
    encode: boolean,
    encryption: PDFFlateStreamEncryptionParams | null,
  ) {
    super(context.obj({}), encode, encryption);

    this.context = context;
    this.objects = objects;
    this.offsets = this.computeObjectOffsets();
    this.offsetsString = this.computeOffsetsString();

    this.dict.set(PDFName.of('Type'), PDFName.of('ObjStm'));
    this.dict.set(PDFName.of('N'), PDFNumber.of(this.objects.length));
    this.dict.set(PDFName.of('First'), PDFNumber.of(this.offsetsString.length));
  }

  getObjectsCount(): number {
    return this.objects.length;
  }

  clone(context?: PDFContext): PDFObjectStream {
    return PDFObjectStream.withContextAndObjects(
      context || this.dict.context,
      this.objects.slice(),
      this.encode,
    );
  }

  getContentsString(): string {
    let value = this.offsetsString;
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      value += `${object}\n`;
    }
    return value;
  }

  getUnencodedContents(): Uint8Array {
    const buffer = new Uint8Array(this.getUnencodedContentsSize());
    let offset = copyStringIntoBuffer(this.offsetsString, buffer, 0);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [, object] = this.objects[idx];
      offset += object.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  getUnencodedContentsSize(): number {
    return (
      this.offsetsString.length +
      last(this.offsets)[1] +
      last(this.objects)[1].sizeInBytes() +
      1
    );
  }

  private computeOffsetsString(): string {
    let offsetsString = '';
    for (let idx = 0, len = this.offsets.length; idx < len; idx++) {
      const [objectNumber, offset] = this.offsets[idx];
      offsetsString += `${objectNumber} ${offset} `;
    }
    return offsetsString;
  }

  private computeObjectOffsets(): [number, number][] {
    let offset = 0;
    const offsets = new Array(this.objects.length);
    for (let idx = 0, len = this.objects.length; idx < len; idx++) {
      const [ref, object] = this.objects[idx];
      offsets[idx] = [ref.objectNumber, offset];
      offset += object.sizeInBytes() + 1; // '\n'
    }
    return offsets;
  }

  encryptWith(encrypter: ObjectEncrypter, reference: PDFRef): PDFObject {
    return new PDFObjectStream(
      this.context,
      this.objects.slice(),
      this.encode,
      { encrypter, reference },
    );
  }
}
