import {
  InvalidIntegerPassedError,
  InvalidMultiplePassedError,
  InvalidOptionPassedError,
  InvalidPositiveNumberPassedError,
  InvalidRangePassedError,
  InvalidTypePassedError,
} from 'src/utils/errors.js';
import { values as objectValues } from 'src/utils/objects.js';
import type {
  Primitive,
  TypeDescriptor,
} from 'src/utils/validators-helpers.js';
import { isType } from 'src/utils/validators-helpers.js';

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
  throw new InvalidOptionPassedError(valueName, allowedValues, value);
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

export const assertIs = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  for (let idx = 0, len = types.length; idx < len; idx++) {
    if (isType(value, types[idx])) return;
  }
  throw new InvalidTypePassedError(valueName, types, value);
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
    throw new InvalidRangePassedError(valueName, min, max, value);
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
    throw new InvalidMultiplePassedError(valueName, multiplier, value);
  }
};

export const assertInteger = (value: any, valueName: string) => {
  if (!Number.isInteger(value)) {
    throw new InvalidIntegerPassedError(valueName, value);
  }
};

export const assertPositive = (value: number, valueName: string) => {
  if (![1, 0].includes(Math.sign(value))) {
    // prettier-ignore
    throw new InvalidPositiveNumberPassedError(valueName, value);
  }
};
