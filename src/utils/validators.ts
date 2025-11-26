import { values as objectValues } from 'src/utils/objects';
import type { Primitive, TypeDescriptor } from 'src/utils/validators-helpers';
import { isType } from 'src/utils/validators-helpers';

export const backtick = (val: any) => `\`${val}\``;
export const singleQuote = (val: any) => `'${val}'`;

// prettier-ignore
const formatValue = (value: any) => {
  const type = typeof value;
  if (type ==='string') return singleQuote(value);
  else if (type ==='undefined') return backtick(value);
  else return value;
};

export const createValueErrorMsg = (
  value: any,
  valueName: string,
  values: Primitive[],
) => {
  const allowedValues = new Array(values.length);

  for (let idx = 0, len = values.length; idx < len; idx++) {
    const v = values[idx];
    allowedValues[idx] = formatValue(v);
  }

  const joinedValues = allowedValues.join(' or ');

  // prettier-ignore
  return `${backtick(valueName)} must be one of ${joinedValues}, but was actually ${formatValue(value)}`;
};

export const assertIsOneOf = (
  value: any,
  valueName: string,
  allowedValues: Primitive[] | { [key: string]: Primitive },
) => {
  if (!Array.isArray(allowedValues)) {
    allowedValues = objectValues(allowedValues);
  }
  for (let idx = 0, len = allowedValues.length; idx < len; idx++) {
    if (value === allowedValues[idx]) return;
  }
  throw new TypeError(createValueErrorMsg(value, valueName, allowedValues));
};

export const assertIsOneOfOrUndefined = (
  value: any,
  valueName: string,
  allowedValues: Primitive[] | { [key: string]: Primitive },
) => {
  if (!Array.isArray(allowedValues)) {
    allowedValues = objectValues(allowedValues);
  }
  assertIsOneOf(value, valueName, allowedValues.concat(undefined));
};

export const assertIsSubset = (
  values: any[],
  valueName: string,
  allowedValues: Primitive[] | { [key: string]: Primitive },
) => {
  if (!Array.isArray(allowedValues)) {
    allowedValues = objectValues(allowedValues);
  }
  for (let idx = 0, len = values.length; idx < len; idx++) {
    assertIsOneOf(values[idx], valueName, allowedValues);
  }
};

export const getType = (val: any) => {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return 'string';
  if (isNaN(val)) return 'NaN';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'symbol') return 'symbol';
  if (typeof val === 'bigint') return 'bigint';
  if (val.constructor && val.constructor.name) return val.constructor.name;
  if (val.name) return val.name;
  if (val.constructor) return String(val.constructor);
  return String(val);
};

export const createTypeErrorMsg = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  const allowedTypes = new Array(types.length);

  for (let idx = 0, len = types.length; idx < len; idx++) {
    const type = types[idx];
    if (type === 'null') allowedTypes[idx] = backtick('null');
    if (type === 'undefined') allowedTypes[idx] = backtick('undefined');
    if (type === 'string') allowedTypes[idx] = backtick('string');
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

  const joinedTypes = allowedTypes.join(' or ');

  // prettier-ignore
  return `${backtick(valueName)} must be of type ${joinedTypes}, but was actually of type ${backtick(getType(value))}`;
};

export const assertIs = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  for (let idx = 0, len = types.length; idx < len; idx++) {
    if (isType(value, types[idx])) return;
  }
  throw new TypeError(createTypeErrorMsg(value, valueName, types));
};

export const assertOrUndefined = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  assertIs(value, valueName, types.concat('undefined'));
};

export const assertEachIs = (
  values: any[],
  valueName: string,
  types: TypeDescriptor[],
) => {
  for (let idx = 0, len = values.length; idx < len; idx++) {
    assertIs(values[idx], valueName, types);
  }
};

export const assertRange = (
  value: any,
  valueName: string,
  min: number,
  max: number,
) => {
  assertIs(value, valueName, ['number']);
  assertIs(min, 'min', ['number']);
  assertIs(max, 'max', ['number']);
  max = Math.max(min, max);
  if (value < min || value > max) {
    // prettier-ignore
    throw new Error(`${backtick(valueName)} must be at least ${min} and at most ${max}, but was actually ${value}`);
  }
};

export const assertRangeOrUndefined = (
  value: any,
  valueName: string,
  min: number,
  max: number,
) => {
  assertIs(value, valueName, ['number', 'undefined']);
  if (typeof value === 'number') assertRange(value, valueName, min, max);
};

export const assertMultiple = (
  value: any,
  valueName: string,
  multiplier: number,
) => {
  assertIs(value, valueName, ['number']);
  if (value % multiplier !== 0) {
    // prettier-ignore
    throw new Error(`${backtick(valueName)} must be a multiple of ${multiplier}, but was actually ${value}`);
  }
};

export const assertInteger = (value: any, valueName: string) => {
  if (!Number.isInteger(value)) {
    throw new Error(
      `${backtick(valueName)} must be an integer, but was actually ${value}`,
    );
  }
};

export const assertPositive = (value: number, valueName: string) => {
  if (![1, 0].includes(Math.sign(value))) {
    // prettier-ignore
    throw new Error(`${backtick(valueName)} must be a positive number or 0, but was actually ${value}`);
  }
};
