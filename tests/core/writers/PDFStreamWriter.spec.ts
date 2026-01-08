import { PDFContext } from 'src/core/PDFContext.js';
import { PDFName } from 'src/core/objects/PDFName.js';
import { PDFRef } from 'src/core/objects/PDFRef.js';
import { PDFStreamWriter } from 'src/core/writers/PDFStreamWriter.js';
import { readBinaryFileSync } from '../../test-utils.js';

const expectedPdfBytes = readBinaryFileSync(
  './tests/core/writers/data/stream-writer-1.pdf',
);

const contentStreamText = `
  BT
    /F1 24 Tf
    100 100 Td
    (Hello World and stuff!) Tj
  ET
`;

describe(`PDFStreamWriter`, () => {
  it(`serializes PDFContext objects using Indirect Objects, Object Streams, and XRef Streams`, async () => {
    const context = PDFContext.create();

    const contentStream = context.flateStream(contentStreamText);
    const contentStreamRef = PDFRef.of(9000);
    context.assign(contentStreamRef, contentStream);

    const fontDict = context.obj({
      Type: 'Font',
      Subtype: 'Type1',
      Name: 'F1',
      BaseFont: 'Helvetica',
      Encoding: 'MacRomanEncoding',
    });
    const fontDictRef = context.register(fontDict);

    const page = context.obj({
      Type: 'Page',
      MediaBox: [0, 0, 612, 792],
      Contents: contentStreamRef,
      Resources: { Font: { F1: fontDictRef } },
    });
    const pageRef = context.register(page);

    const pages = context.obj({
      Type: 'Pages',
      Kids: [pageRef],
      Count: 1,
    });
    const pagesRef = context.register(pages);
    page.set(PDFName.of('Parent'), pagesRef);

    const catalog = context.obj({
      Type: 'Catalog',
      Pages: pagesRef,
    });
    context.trailerInfo.Root = context.register(catalog);

    const buffer = await PDFStreamWriter.forContext(
      context,
      Infinity,
      false,
      2,
    ).serializeToBuffer();

    expect(buffer.length).toBe(expectedPdfBytes.length);
    expect(buffer).toEqual(expectedPdfBytes);
  });
});
