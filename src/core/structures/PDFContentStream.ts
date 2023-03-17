import type { PDFDict } from 'src/core/objects/PDFDict';
import type { Encrypter } from 'src/core/objects/EncryptableObject';
import type { PDFOperator } from 'src/core/operators/PDFOperator';
import type { PDFContext } from 'src/core/PDFContext';
import { PDFFlateStream } from 'src/core/structures/PDFFlateStream';
import { CharCodes } from 'src/core/syntax/CharCodes';

export class PDFContentStream extends PDFFlateStream {
  static of = (dict: PDFDict, operators: PDFOperator[], encode = true) =>
    new PDFContentStream(dict, operators, encode, null);

  private readonly operators: PDFOperator[];

  private constructor(
    dict: PDFDict,
    operators: PDFOperator[],
    encode: boolean,
    encrypter: Encrypter | null,
  ) {
    super(dict, encode, encrypter);
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

  encryptWith(encrypter: Encrypter): PDFContentStream {
    return new PDFContentStream(
      this.dict.clone(this.dict.context),
      this.operators.map((e) => e.clone()),
      this.encode,
      encrypter,
    );
  }
}
