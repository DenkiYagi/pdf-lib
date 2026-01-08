import { PDFContext } from 'src/core/PDFContext.js';
import { JpegEmbedder } from 'src/core/embedders/JpegEmbedder.js';
import { PDFRawStream } from 'src/core/objects/PDFRawStream.js';
import { PDFRef } from 'src/core/objects/PDFRef.js';
import { readBinaryFileSync } from '../../test-utils.js';

const catUnicornJpg = readBinaryFileSync(
  './assets/images/cat_riding_unicorn.jpg',
);
const minionsLaughing = readBinaryFileSync(
  './assets/images/minions_laughing.jpg',
);
const cmykJpg = readBinaryFileSync('./assets/images/cmyk_colorspace.jpg');

describe(`JpegEmbedder`, () => {
  it(`can be constructed with JpegEmbedder.for(...)`, async () => {
    const embedder = await JpegEmbedder.for(catUnicornJpg);
    expect(embedder).toBeInstanceOf(JpegEmbedder);
  });

  it(`can embed JPEG images into PDFContexts without a predefined ref`, async () => {
    const context = PDFContext.create();
    const embedder = await JpegEmbedder.for(catUnicornJpg);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(ref)).toBeInstanceOf(PDFRawStream);
  });

  it(`can embed JPEG images into PDFContexts with a predefined ref`, async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const embedder = await JpegEmbedder.for(catUnicornJpg);

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(1);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFRawStream);
    expect(ref).toBe(predefinedRef);
  });

  it(`can extract properties of JPEG images (1)`, async () => {
    const embedder = await JpegEmbedder.for(catUnicornJpg);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(1080);
    expect(embedder.width).toBe(1920);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });

  it(`can extract properties of JPEG images (2)`, async () => {
    const embedder = await JpegEmbedder.for(minionsLaughing);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(354);
    expect(embedder.width).toBe(630);
    expect(embedder.colorSpace).toBe('DeviceRGB');
  });

  it(`can extract properties of JPEG images (3)`, async () => {
    const embedder = await JpegEmbedder.for(cmykJpg);

    expect(embedder.bitsPerComponent).toBe(8);
    expect(embedder.height).toBe(333);
    expect(embedder.width).toBe(500);
    expect(embedder.colorSpace).toBe('DeviceCMYK');
  });
});
