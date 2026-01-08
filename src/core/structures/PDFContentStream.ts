import type { ObjectEncrypter } from '../objects/ObjectEncrypter.js';
import type { PDFDict } from '../objects/PDFDict.js';
import type { PDFObject } from '../objects/PDFObject.js';
import type { PDFRef } from '../objects/PDFRef.js';
import type { PDFOperator } from '../operators/PDFOperator.js';
import type { PDFContext } from '../PDFContext.js';
import {
  PDFFlateStream,
  PDFFlateStreamEncryptionParams,
} from './PDFFlateStream.js';
import { CharCodes } from '../syntax/CharCodes.js';

export class PDFContentStream extends PDFFlateStream {
  static of = (dict: PDFDict, operators: PDFOperator[], encode = true) =>
    new PDFContentStream(dict, operators, encode, null);

  private readonly operators: PDFOperator[];

  private constructor(
    dict: PDFDict,
    operators: PDFOperator[],
    encode: boolean,
    encryption: PDFFlateStreamEncryptionParams | null,
  ) {
    super(dict, encode, encryption);
    this.operators = operators;
  }

  push(...operators: PDFOperator[]): void {
    this.operators.push(...operators);
  }

  clone(context?: PDFContext): PDFContentStream {
    const operators = new Array(this.operators.length);
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      operators[idx] = this.operators[idx].clone(context);
    }
    const { dict, encode } = this;
    return PDFContentStream.of(dict.clone(context), operators, encode);
  }

  getContentsString(): string {
    let value = '';
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      value += `${this.operators[idx]}\n`;
    }
    return value;
  }

  getUnencodedContents(): Uint8Array {
    const buffer = new Uint8Array(this.getUnencodedContentsSize());
    let offset = 0;
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      offset += this.operators[idx].copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }
    return buffer;
  }

  getUnencodedContentsSize(): number {
    let size = 0;
    for (let idx = 0, len = this.operators.length; idx < len; idx++) {
      size += this.operators[idx].sizeInBytes() + 1;
    }
    return size;
  }

  encryptWith(encrypter: ObjectEncrypter, reference: PDFRef): PDFObject {
    return new PDFContentStream(
      this.dict.clone(this.dict.context),
      this.operators.map((e) => e.clone()),
      this.encode,
      { encrypter, reference },
    );
  }
}
