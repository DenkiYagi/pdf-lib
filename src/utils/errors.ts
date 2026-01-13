// tslint:disable: max-classes-per-file

import type { Primitive, TypeDescriptor } from './validators-helpers.js';
import { getType } from './validators-helpers.js';
import { PDFLibError, PDFLibErrorTypes } from '../core/error-base.js';

export class PDFLibUtilsError extends PDFLibError {}

const backtick = (val: any) => `\`${val}\``;
const singleQuote = (val: any) => `'${val}'`;

const formatValue = (value: any) => {
  const type = typeof value;
  if (type === 'string') return singleQuote(value);
  if (type === 'undefined') return backtick(value);
  return value;
};

const formatAllowedTypes = (types: TypeDescriptor[]) => {
  const allowedTypes = new Array(types.length);

  for (let idx = 0, len = types.length; idx < len; idx++) {
    const type = types[idx];
    if (type === 'null') allowedTypes[idx] = backtick('null');
    else if (type === 'undefined') allowedTypes[idx] = backtick('undefined');
    else if (type === 'string') allowedTypes[idx] = backtick('string');
    else if (type === 'number') allowedTypes[idx] = backtick('number');
    else if (type === 'boolean') allowedTypes[idx] = backtick('boolean');
    else if (type === 'symbol') allowedTypes[idx] = backtick('symbol');
    else if (type === 'bigint') allowedTypes[idx] = backtick('bigint');
    else if (type === Array) allowedTypes[idx] = backtick('Array');
    else if (type === Uint8Array) allowedTypes[idx] = backtick('Uint8Array');
    else if (type === Uint16Array) allowedTypes[idx] = backtick('Uint16Array');
    else if (type === Uint32Array) allowedTypes[idx] = backtick('Uint32Array');
    else if (type === ArrayBuffer) allowedTypes[idx] = backtick('ArrayBuffer');
    // tslint:disable-next-line:ban-types
    else allowedTypes[idx] = backtick((type as [Function, string])[1]);
  }

  return allowedTypes.join(' or ');
};

export class InvalidPngError extends PDFLibUtilsError {
  constructor(message: string) {
    super(PDFLibErrorTypes.INVALID_EXTERNAL_BINARY_DATA, message);
  }
}

export class InvalidOptionPassedError extends PDFLibUtilsError {
  constructor(valueName: string, allowedValues: Primitive[], actual: any) {
    const allowed = allowedValues.map(formatValue).join(' or ');
    const msg =
      `${backtick(valueName)} must be one of ${allowed}, ` +
      `but was actually ${formatValue(actual)}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidTypePassedError extends PDFLibUtilsError {
  constructor(valueName: string, types: TypeDescriptor[], actual: any) {
    const msg =
      `${backtick(valueName)} must be of type ${formatAllowedTypes(types)}, ` +
      `but was actually of type ${backtick(getType(actual))}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidRangePassedError extends PDFLibUtilsError {
  constructor(valueName: string, min: number, max: number, actual: number) {
    const msg =
      `${backtick(valueName)} must be at least ${min} and at most ${max}, ` +
      `but was actually ${actual}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidMultiplePassedError extends PDFLibUtilsError {
  constructor(valueName: string, multiplier: number, actual: number) {
    const msg =
      `${backtick(valueName)} must be a multiple of ${multiplier}, ` +
      `but was actually ${actual}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidIntegerPassedError extends PDFLibUtilsError {
  constructor(valueName: string, actual: any) {
    const msg = `${backtick(valueName)} must be an integer, but was actually ${actual}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidPositiveNumberPassedError extends PDFLibUtilsError {
  constructor(valueName: string, actual: number) {
    const msg =
      `${backtick(valueName)} must be a positive number or 0, ` +
      `but was actually ${actual}`;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}

export class InvalidWordBreakError extends PDFLibUtilsError {
  constructor(newlineUnion: string) {
    const msg = '`wordBreak` must not include ' + newlineUnion;
    super(PDFLibErrorTypes.INVALID_CALLER_INPUT, msg);
  }
}
