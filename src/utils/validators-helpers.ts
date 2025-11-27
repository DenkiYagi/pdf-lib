export type Primitive = string | number | boolean | undefined | null;

export type TypeDescriptor =
  | 'null'
  | 'undefined'
  | 'string'
  | 'number'
  | 'boolean'
  | 'symbol'
  | 'bigint'
  | DateConstructor
  | ArrayConstructor
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | ArrayBufferConstructor
  | FunctionConstructor
  // tslint:disable-next-line:ban-types
  | [Function, string];

export const isType = (value: any, type: TypeDescriptor) => {
  if (type === 'null') return value === null;
  if (type === 'undefined') return value === undefined;
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number' && !isNaN(value);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'symbol') return typeof value === 'symbol';
  if (type === 'bigint') return typeof value === 'bigint';
  if (type === Date) return value instanceof Date;
  if (type === Array) return value instanceof Array;
  if (type === Uint8Array) return value instanceof Uint8Array;
  if (type === Uint16Array) return value instanceof Uint16Array;
  if (type === Uint32Array) return value instanceof Uint32Array;
  if (type === ArrayBuffer) return value instanceof ArrayBuffer;
  // tslint:disable-next-line:ban-types
  if (type === Function) return value instanceof Function;
  // tslint:disable-next-line:ban-types
  return value instanceof (type as [Function, string])[0];
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
