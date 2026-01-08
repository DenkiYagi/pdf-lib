import { PDFDocument } from 'src/api/PDFDocument.js';
import { PDFImage } from 'src/api/PDFImage.js';
import { PngEmbedder } from 'src/core/embedders/PngEmbedder.js';
import { readBinaryFileSync } from '../test-utils.js';

const examplePngImage = readBinaryFileSync('assets/images/etwe.png');

describe(`PDFImage`, () => {
  describe(`embed() method`, () => {
    it(`clears the 'embedder' field after the first call`, async () => {
      const pdfDoc = await PDFDocument.create();

      const embedder = await PngEmbedder.for(examplePngImage);
      const ref = pdfDoc.context.nextRef();
      const pdfImage = PDFImage.of(ref, pdfDoc, embedder);

      const embedderVariable = 'embedder';
      expect(pdfImage[embedderVariable]).toBeDefined();
      await pdfImage.embed();
      expect(pdfImage[embedderVariable]).toBeUndefined();
    });

    it(`may be called multiple times without causing an error`, async () => {
      const pdfDoc = await PDFDocument.create();

      const embedder = await PngEmbedder.for(examplePngImage);
      const ref = pdfDoc.context.nextRef();
      const pdfImage = PDFImage.of(ref, pdfDoc, embedder);

      await expect(pdfImage.embed()).resolves.not.toThrowError();
      await expect(pdfImage.embed()).resolves.not.toThrowError();
    });

    it(`may be called in parallel without causing an error`, async () => {
      const pdfDoc = await PDFDocument.create();

      const embedder = await PngEmbedder.for(examplePngImage);
      const ref = pdfDoc.context.nextRef();
      const pdfImage = PDFImage.of(ref, pdfDoc, embedder);

      // tslint:disable-next-line
      const task = () => pdfImage['embedTask'];

      expect(task()).toBeUndefined();

      const task1 = pdfImage.embed();
      const firstTask = task();

      const task2 = pdfImage.embed();
      const secondTask = task();

      await Promise.all([task1, task2]);

      expect(firstTask).toEqual(secondTask);
    });
  });
});
