import pako from 'pako';
import {
  moveText,
  popGraphicsState,
  pushGraphicsState,
} from '../../../src/api/operators.js';

import { PDFContext } from '../../../src/core/PDFContext.js';
import { PDFDict } from '../../../src/core/objects/PDFDict.js';
import { PDFName } from '../../../src/core/objects/PDFName.js';
import { PDFNumber } from '../../../src/core/objects/PDFNumber.js';
import { PDFObject } from '../../../src/core/objects/PDFObject.js';
import { PDFRef } from '../../../src/core/objects/PDFRef.js';
import { PDFString } from '../../../src/core/objects/PDFString.js';
import { PDFOperator } from '../../../src/core/operators/PDFOperator.js';
import { PDFOperatorNames as Ops } from '../../../src/core/operators/PDFOperatorNames.js';
import { PDFContentStream } from '../../../src/core/structures/PDFContentStream.js';
import {
  mergeIntoTypedArray,
  typedArrayFor,
} from '../../../src/utils/arrays.js';
import { toCharCode } from '../../../src/utils/strings.js';
import { security } from '../objects/shared.js';

describe(`PDFContentStream`, () => {
  const context = PDFContext.create();
  const dict = PDFDict.withContext(context);
  const operators = [
    PDFOperator.of(Ops.BeginText),
    PDFOperator.of(Ops.SetFontAndSize, [PDFName.of('F1'), PDFNumber.of(24)]),
    PDFOperator.of(Ops.MoveText, [PDFNumber.of(100), PDFNumber.of(100)]),
    PDFOperator.of(Ops.ShowText, [PDFString.of('Hello World and stuff!')]),
    PDFOperator.of(Ops.EndText),
  ];

  it(`can be constructed from PDFContentStream.of(...)`, () => {
    expect(PDFContentStream.of(dict, operators, false)).toBeInstanceOf(
      PDFContentStream,
    );
  });

  it(`allows operators to be pushed to the end of the stream`, () => {
    const stream = PDFContentStream.of(dict, [pushGraphicsState()], false);
    stream.push(moveText(21, 99), popGraphicsState());
    expect(String(stream)).toEqual(
      '<<\n/Length 13\n>>\n' +
        'stream\n' +
        'q\n' +
        '21 99 Td\n' +
        'Q\n' +
        '\nendstream',
    );
  });

  it(`can be cloned`, () => {
    const original = PDFContentStream.of(dict, operators, false);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFContentStream.of(dict, operators, false))).toEqual(
      '<<\n/Length 55\n>>\n' +
        'stream\n' +
        'BT\n' +
        '/F1 24 Tf\n' +
        '100 100 Td\n' +
        '(Hello World and stuff!) Tj\n' +
        'ET\n' +
        '\nendstream',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFContentStream.of(dict, operators, false).sizeInBytes()).toBe(89);
  });

  it(`can be serialized`, () => {
    const stream = PDFContentStream.of(dict, operators, false);
    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );
    expect(stream.copyBytesInto(buffer, 2)).toBe(89);
    expect(buffer).toEqual(
      typedArrayFor(
        '  <<\n/Length 55\n>>\n' +
          'stream\n' +
          'BT\n' +
          '/F1 24 Tf\n' +
          '100 100 Td\n' +
          '(Hello World and stuff!) Tj\n' +
          'ET\n' +
          '\nendstream ',
      ),
    );
  });

  it(`can be serialized when encoded`, () => {
    const contents =
      'BT\n' +
      '/F1 24 Tf\n' +
      '100 100 Td\n' +
      '(Hello World and stuff!) Tj\n' +
      'ET\n';
    const encodedContents = pako.deflate(contents);

    const stream = PDFContentStream.of(dict, operators, true);
    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );
    expect(stream.copyBytesInto(buffer, 2)).toBe(115);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        '  <<\n/Length 60\n/Filter /FlateDecode\n>>\n',
        'stream\n',
        encodedContents,
        '\nendstream ',
      ),
    );
  });

  it(`can be encrypted to another PDFObject`, () => {
    const { encryptionKey: key } = security;
    const ref = PDFRef.of(1);

    const input = PDFContentStream.of(dict, operators, false);

    expect(input.encryptWith(key, ref)).toBeInstanceOf(PDFObject);
  });
});
