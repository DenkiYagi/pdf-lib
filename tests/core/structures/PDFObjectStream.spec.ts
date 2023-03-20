import pako from 'pako';

import {
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFInvalidObject,
  PDFObject,
  PDFObjectStream,
  PDFRawStream,
  PDFRef,
  PDFString,
} from 'src/core';
import { mergeIntoTypedArray, toCharCode, typedArrayFor } from 'src/utils';
import { security } from '../objects/shared';

describe(`PDFObjectStream`, () => {
  const context = PDFContext.create();

  const objects: [PDFRef, PDFObject][] = [
    [context.nextRef(), context.obj([])],
    [context.nextRef(), context.obj(true)],
    [context.nextRef(), context.obj({})],
    [context.nextRef(), PDFHexString.of('ABC123')],
    [context.nextRef(), PDFRef.of(21)],
    [context.nextRef(), context.obj('QuxBaz')],
    [context.nextRef(), context.obj(null)],
    [context.nextRef(), context.obj(21)],
    [context.nextRef(), PDFString.of('Stuff and thingz')],
  ];

  it(`can tell if it can store a specified object (without encryption)`, () => {
    const rootRef = PDFRef.of(9999);

    const curContext = PDFContext.create();
    curContext.trailerInfo.Root = rootRef;

    const pdfDict = PDFDict.withContext(curContext);
    const pdfStream = PDFRawStream.of(pdfDict, new Uint8Array());
    const pdfInvalid = PDFInvalidObject.of(new Uint8Array());

    // Root entry (if not encrypted)
    expect(PDFObjectStream.shallNotStore([rootRef, pdfDict], curContext)).toBe(
      false,
    );

    // generation number > 0
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 1), pdfDict], curContext),
    ).toBe(true);

    // stream object
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 0), pdfStream], curContext),
    ).toBe(true);

    // invalid object
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 0), pdfInvalid], curContext),
    ).toBe(true);

    // otherwise
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 0), pdfDict], curContext),
    ).toBe(false);
  });

  it(`can tell if it can store a specified object (with encryption)`, () => {
    const rootRef = PDFRef.of(9999);
    const encryptRef = PDFRef.of(9998);

    const curContext = PDFContext.create();
    curContext.trailerInfo.Root = rootRef;
    curContext.trailerInfo.Encrypt = encryptRef;

    const pdfDict = PDFDict.withContext(curContext);
    const pdfStream = PDFRawStream.of(pdfDict, new Uint8Array());
    const pdfInvalid = PDFInvalidObject.of(new Uint8Array());

    // Root entry (if encrypted)
    expect(PDFObjectStream.shallNotStore([rootRef, pdfDict], curContext)).toBe(
      true,
    );

    // Encrypt entry
    expect(
      PDFObjectStream.shallNotStore([encryptRef, pdfDict], curContext),
    ).toBe(true);

    // generation number > 0
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 1), pdfDict], curContext),
    ).toBe(true);

    // stream object
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 0), pdfStream], curContext),
    ).toBe(true);

    // invalid object
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 0), pdfInvalid], curContext),
    ).toBe(true);

    // otherwise
    expect(
      PDFObjectStream.shallNotStore([PDFRef.of(1, 0), pdfDict], curContext),
    ).toBe(false);
  });

  it(`can be constructed from PDFObjectStream.of(...)`, () => {
    expect(
      PDFObjectStream.withContextAndObjects(context, objects, false),
    ).toBeInstanceOf(PDFObjectStream);
  });

  it(`can be cloned`, () => {
    const original = PDFObjectStream.withContextAndObjects(
      context,
      objects,
      false,
    );
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be converted to a string`, () => {
    expect(
      String(PDFObjectStream.withContextAndObjects(context, objects, false)),
    ).toEqual(
      '<<\n/Type /ObjStm\n/N 9\n/First 42\n/Length 108\n>>\n' +
        'stream\n' +
        '1 0 2 4 3 9 4 15 5 24 6 31 7 39 8 44 9 47 ' +
        '[ ]\n' +
        'true\n' +
        '<<\n>>\n' +
        '<ABC123>\n' +
        '21 0 R\n' +
        '/QuxBaz\n' +
        'null\n' +
        '21\n' +
        '(Stuff and thingz)\n' +
        '\nendstream',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(
      PDFObjectStream.withContextAndObjects(
        context,
        objects,
        false,
      ).sizeInBytes(),
    ).toBe(172);
  });

  it(`can be serialized`, () => {
    const stream = PDFObjectStream.withContextAndObjects(
      context,
      objects,
      false,
    );
    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );
    expect(stream.copyBytesInto(buffer, 2)).toBe(172);
    expect(buffer).toEqual(
      typedArrayFor(
        '  <<\n/Type /ObjStm\n/N 9\n/First 42\n/Length 108\n>>\n' +
          'stream\n' +
          '1 0 2 4 3 9 4 15 5 24 6 31 7 39 8 44 9 47 ' +
          '[ ]\n' +
          'true\n' +
          '<<\n>>\n' +
          '<ABC123>\n' +
          '21 0 R\n' +
          '/QuxBaz\n' +
          'null\n' +
          '21\n' +
          '(Stuff and thingz)\n' +
          '\nendstream ',
      ),
    );
  });

  it(`can be serialized when encoded`, () => {
    const contents =
      '1 0 2 4 3 9 4 15 5 24 6 31 7 39 8 44 9 47 ' +
      '[ ]\n' +
      'true\n' +
      '<<\n>>\n' +
      '<ABC123>\n' +
      '21 0 R\n' +
      '/QuxBaz\n' +
      'null\n' +
      '21\n' +
      '(Stuff and thingz)\n';
    const encodedContents = pako.deflate(contents);

    const stream = PDFObjectStream.withContextAndObjects(
      context,
      objects,
      true,
    );
    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );
    expect(stream.copyBytesInto(buffer, 2)).toBe(195);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        '  <<\n/Filter /FlateDecode\n/Type /ObjStm\n/N 9\n/First 42\n/Length 110\n>>\n',
        'stream\n',
        encodedContents,
        '\nendstream ',
      ),
    );
  });

  it(`can be encrypted to another PDFObject`, () => {
    const { encryptionKey: key } = security;
    const ref = PDFRef.of(1);

    const input = PDFObjectStream.withContextAndObjects(
      context,
      objects,
      false,
    );
    expect(input.encryptWith(key, ref)).toBeInstanceOf(PDFObject);
  });
});
