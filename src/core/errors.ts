// tslint:disable: max-classes-per-file

import { arrayAsString } from 'src/utils/arrays';
import { PDFLibError, PDFLibErrorType, PDFLibErrorTypes } from './error-base';

export class PDFLibCoreError extends PDFLibError {}

const formatCodePointHex = (codePoint: number) =>
  codePoint.toString(16).toUpperCase().padStart(2, '0');

export class InvalidUnicodeCodePointError extends PDFLibCoreError {
  constructor(
    codePoint: number,
    originType: PDFLibErrorType = PDFLibErrorTypes.INTERNAL_ASSERTION,
    reason?: string,
  ) {
    const hex = formatCodePointHex(codePoint);
    const detail = reason ? ` (${reason})` : '';
    const msg = `Invalid code point: 0x${hex}${detail}`;
    super(originType, msg);
  }
}

export class InvalidByteOrderError extends PDFLibCoreError {
  constructor(byteOrder: number) {
    const msg = `Invalid byteOrder: ${byteOrder}`;
    super(PDFLibErrorTypes.INTERNAL_ASSERTION, msg);
  }
}

export class InvalidFontTypeError extends PDFLibCoreError {
  constructor(
    fontType: string,
    originType: PDFLibErrorType = PDFLibErrorTypes.UNSUPPORTED_EXTERNAL_BINARY_DATA,
  ) {
    const msg = `Invalid font type: ${fontType}`;
    super(originType, msg);
  }
}

export class UnsupportedFontFileFormatError extends PDFLibCoreError {
  constructor(message: string) {
    super(PDFLibErrorTypes.UNSUPPORTED_EXTERNAL_BINARY_DATA, message);
  }
}

export class UnsupportedFontDataError extends PDFLibCoreError {
  constructor(message: string) {
    super(PDFLibErrorTypes.UNSUPPORTED_EXTERNAL_BINARY_DATA, message);
  }
}

export class InvalidFontDataError extends PDFLibCoreError {
  constructor(message: string) {
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, message);
  }
}

export class FontkitAssertionError extends PDFLibCoreError {
  constructor(message: string) {
    super(PDFLibErrorTypes.INTERNAL_ASSERTION, message);
  }
}

export class MethodNotImplementedError extends PDFLibCoreError {
  constructor(className: string, methodName: string) {
    const msg = `Method ${className}.${methodName}() not implemented`;
    super(PDFLibErrorTypes.INTERNAL_ASSERTION, msg);
  }
}

export class PrivateConstructorError extends PDFLibCoreError {
  constructor(className: string) {
    const msg = `Cannot construct ${className} - it has a private constructor`;
    super(PDFLibErrorTypes.INTERNAL_ASSERTION, msg);
  }
}

export class UnexpectedObjectTypeError extends PDFLibCoreError {
  constructor(expected: any | any[], actual: any) {
    const name = (t: any) => t?.name ?? t?.constructor?.name;

    const expectedTypes = Array.isArray(expected)
      ? expected.map(name)
      : [name(expected)];

    const msg =
      `Expected instance of ${expectedTypes.join(' or ')}, ` +
      `but got instance of ${actual ? name(actual) : actual}`;

    super(PDFLibErrorTypes.INTERNAL_ASSERTION, msg);
  }
}

export class UnsupportedEncodingError extends PDFLibCoreError {
  constructor(encoding: string) {
    const msg = `${encoding} stream encoding not supported`;
    super(PDFLibErrorTypes.UNSUPPORTED_EXTERNAL_BINARY_DATA, msg);
  }
}

export class ReparseError extends PDFLibCoreError {
  constructor(className: string, methodName: string) {
    const msg = `Cannot call ${className}.${methodName}() more than once`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class MissingPageContentsEmbeddingError extends PDFLibCoreError {
  constructor() {
    const msg = `Can't embed page with missing Contents`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class UnrecognizedStreamTypeError extends PDFLibCoreError {
  constructor(stream: any) {
    const streamType = stream?.contructor?.name ?? stream?.name ?? stream;
    const msg = `Unrecognized stream type: ${streamType}`;
    super(PDFLibErrorTypes.INTERNAL_ASSERTION, msg);
  }
}

export class PageEmbeddingMismatchedContextError extends PDFLibCoreError {
  constructor() {
    const msg = `Found mismatched contexts while embedding pages. All pages in the array passed to \`PDFDocument.embedPages()\` must be from the same document.`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class PDFArrayIsNotRectangleError extends PDFLibCoreError {
  constructor(size: number) {
    const msg = `Attempted to convert PDFArray with ${size} elements to rectangle, but must have exactly 4 elements.`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class InvalidPDFDateStringError extends PDFLibCoreError {
  constructor(value: string) {
    const msg = `Attempted to convert "${value}" to a date, but it does not match the PDF date string format.`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class InvalidTargetIndexError extends PDFLibCoreError {
  constructor(targetIndex: number, Count: number) {
    const msg = `Invalid targetIndex specified: targetIndex=${targetIndex} must be less than Count=${Count}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class CorruptPageTreeError extends PDFLibCoreError {
  constructor(targetIndex: number, operation: string) {
    const msg = `Failed to ${operation} at targetIndex=${targetIndex} due to corrupt page tree: It is likely that one or more 'Count' entries are invalid`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class IndexOutOfBoundsError extends PDFLibCoreError {
  constructor(index: number, min: number, max: number) {
    const msg = `index should be at least ${min} and at most ${max}, but was actually ${index}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidAcroFieldValueError extends PDFLibCoreError {
  constructor() {
    const msg = `Attempted to set invalid field value`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class MultiSelectValueError extends PDFLibCoreError {
  constructor() {
    const msg = `Attempted to select multiple values for single-select field`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class MissingDAEntryError extends PDFLibCoreError {
  constructor(fieldName: string) {
    const msg = `No /DA (default appearance) entry found for field: ${fieldName}`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class MissingTfOperatorError extends PDFLibCoreError {
  constructor(fieldName: string) {
    const msg = `No Tf operator found for DA of field: ${fieldName}`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class MissingAcroFormFieldError extends PDFLibCoreError {
  constructor(fieldName: string) {
    const msg = `Tried to remove inexistent field ${fieldName}`;
    super(PDFLibErrorTypes.INTERNAL_ASSERTION, msg);
  }
}

export class InvalidIndirectObjectError extends PDFLibCoreError {
  constructor(pos: Position) {
    const msg = `Trying to parse invalid object: ${JSON.stringify(pos)})`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class UnexpectedAppearanceTypeError extends PDFLibCoreError {
  constructor(actual: any) {
    const msg = `Unexpected N type: ${actual?.constructor?.name ?? actual}`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export type FlateDecodingErrorReason =
  | 'INVALID_HEADER'
  | 'UNKNOWN_COMPRESSION_METHOD'
  | 'BAD_FCHECK'
  | 'FDICT_SET'
  | 'BAD_BLOCK_HEADER'
  | 'BAD_UNCOMPRESSED_BLOCK_LENGTH'
  | 'UNKNOWN_BLOCK_TYPE'
  | 'BAD_ENCODING';

export class FlateDecodingError extends PDFLibCoreError {
  readonly reason: FlateDecodingErrorReason;

  constructor(
    reason: FlateDecodingErrorReason,
    details?: { cmf?: number; flg?: number },
  ) {
    let msg: string;
    if (reason === 'INVALID_HEADER') {
      msg = `Invalid header in flate stream: ${details?.cmf}, ${details?.flg}`;
    } else if (reason === 'UNKNOWN_COMPRESSION_METHOD') {
      msg = `Unknown compression method in flate stream: ${details?.cmf}, ${details?.flg}`;
    } else if (reason === 'BAD_FCHECK') {
      msg = `Bad FCHECK in flate stream: ${details?.cmf}, ${details?.flg}`;
    } else if (reason === 'FDICT_SET') {
      msg = `FDICT bit set in flate stream: ${details?.cmf}, ${details?.flg}`;
    } else if (reason === 'BAD_BLOCK_HEADER') {
      msg = 'Bad block header in flate stream';
    } else if (reason === 'BAD_UNCOMPRESSED_BLOCK_LENGTH') {
      msg = 'Bad uncompressed block length in flate stream';
    } else if (reason === 'UNKNOWN_BLOCK_TYPE') {
      msg = 'Unknown block type in flate stream';
    } else {
      msg = 'Bad encoding in flate stream';
    }

    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
    this.reason = reason;
  }
}

export class InvalidPasswordError extends PDFLibCoreError {
  constructor() {
    super(
      PDFLibErrorTypes.INVALID_CALLER_INPUT,
      'Password contains invalid characters.',
    );
  }
}

export type InvalidJpegReason =
  | 'SOI_NOT_FOUND'
  | 'INVALID_MARKER'
  | 'UNKNOWN_CHANNEL';

export class InvalidJpegError extends PDFLibCoreError {
  readonly reason: InvalidJpegReason;

  constructor(reason: InvalidJpegReason) {
    let msg: string;
    if (reason === 'SOI_NOT_FOUND') msg = 'SOI not found in JPEG';
    else if (reason === 'INVALID_MARKER') msg = 'Invalid marker found in JPEG';
    else if (reason === 'UNKNOWN_CHANNEL') msg = 'Unknown JPEG channel.';
    else msg = 'Invalid JPEG';

    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
    this.reason = reason;
  }
}

/***** Parser Errors ******/

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export class NumberParsingError extends PDFLibCoreError {
  constructor(pos: Position, value: string) {
    const msg =
      `Failed to parse number ` +
      `(line:${pos.line} col:${pos.column} offset=${pos.offset}): "${value}"`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class PDFParsingError extends PDFLibCoreError {
  constructor(pos: Position, details: string) {
    const msg =
      `Failed to parse PDF document ` +
      `(line:${pos.line} col:${pos.column} offset=${pos.offset}): ${details}`;
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, msg);
  }
}

export class NextByteAssertionError extends PDFParsingError {
  constructor(pos: Position, expectedByte: number, actualByte: number) {
    const msg = `Expected next byte to be ${expectedByte} but it was actually ${actualByte}`;
    super(pos, msg);
  }
}

export class PDFObjectParsingError extends PDFParsingError {
  constructor(pos: Position, byte: number) {
    const msg = `Failed to parse PDF object starting with the following byte: ${byte}`;
    super(pos, msg);
  }
}

export class PDFInvalidObjectParsingError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Failed to parse invalid PDF object`;
    super(pos, msg);
  }
}

export class PDFStreamParsingError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Failed to parse PDF stream`;
    super(pos, msg);
  }
}

export class UnbalancedParenthesisError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Failed to parse PDF literal string due to unbalanced parenthesis`;
    super(pos, msg);
  }
}

export class StalledParserError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `Parser stalled`;
    super(pos, msg);
  }
}

export class MissingPDFHeaderError extends PDFParsingError {
  constructor(pos: Position) {
    const msg = `No PDF header found`;
    super(pos, msg);
  }
}

export class MissingKeywordError extends PDFParsingError {
  constructor(pos: Position, keyword: number[]) {
    const msg = `Did not find expected keyword '${arrayAsString(keyword)}'`;
    super(pos, msg);
  }
}
