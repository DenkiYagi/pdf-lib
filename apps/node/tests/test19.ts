import { Assets } from '..';
import { PDFDocument } from '../../..';

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.normal);
  pdfDoc.setTitle('テスト');
  pdfDoc.setAuthor('デンキヤギ');

  const page = pdfDoc.insertPage(0);

  page.drawText('This is a test page\nwith an image.', {
    size: 40,
    x: 60,
    y: 700,
    lineHeight: 50,
  });

  const image = await pdfDoc.embedPng(assets.images.png.mario_emblem);
  page.drawImage(image, { x: 60, y: 500, ...image.scale(1.0) });

  const password = 'asdf';
  pdfDoc.encrypt({ password });

  /********************** Print Metadata **********************/
  console.log('PDF encryption with useObjectStreams: false');
  console.log('password:', password);

  /********************** Export PDF **********************/
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  return pdfBytes;
};
