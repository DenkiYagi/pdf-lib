import { AnnotationFlags } from '../../../src/core/annotation/flags.js';
import { PDFArray } from '../../../src/core/objects/PDFArray.js';
import { PDFHexString } from '../../../src/core/objects/PDFHexString.js';
import { PDFName } from '../../../src/core/objects/PDFName.js';
import { PDFDocument } from '../../../src/api/PDFDocument.js';
import { readBinaryFileSync } from '../../test-utils.js';

const fancyFieldsPdfBytes = readBinaryFileSync('assets/pdfs/fancy_fields.pdf');

describe(`PDFRadioGroup`, () => {
  it(`can read its options`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    expect(historicalFigures.getOptions()).toEqual([
      'Marcus Aurelius 🏛️',
      'Ada Lovelace 💻',
      'Marie Curie ☢️',
      'Alexander Hamilton 🇺🇸',
    ]);
  });

  it(`can read its selected value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    expect(historicalFigures.getSelected()).toEqual('Marcus Aurelius 🏛️');
  });

  it(`can clear its value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    historicalFigures.clear();
    expect(historicalFigures.getSelected()).toBe(undefined);
  });

  it(`can select a value`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');
    historicalFigures.select('Marie Curie ☢️');
    expect(historicalFigures.getSelected()).toBe('Marie Curie ☢️');
  });

  it(`can read its flag states`, async () => {
    const pdfDoc = await PDFDocument.load(fancyFieldsPdfBytes);
    const form = pdfDoc.getForm();
    const historicalFigures = form.getRadioGroup('Historical Figures 🐺');

    expect(historicalFigures.isExported()).toBe(true);
    expect(historicalFigures.isReadOnly()).toBe(false);
    expect(historicalFigures.isRequired()).toBe(false);
    expect(historicalFigures.isMutuallyExclusive()).toBe(true);
    expect(historicalFigures.isOffToggleable()).toBe(false);
  });

  it(`supports mutualExclusion=true`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const form = pdfDoc.getForm();

    const radioGroup = form.createRadioGroup('test.group');
    radioGroup.enableMutualExclusion();

    radioGroup.addOptionToPage('foo', page);
    radioGroup.addOptionToPage('bar', page);
    radioGroup.addOptionToPage('foo', page);
    radioGroup.addOptionToPage('qux', page);

    const getOnWidgets = () =>
      radioGroup.acroField
        .getWidgets()
        .filter((w) => w.getOnValue() === radioGroup.acroField.getValue());

    expect(getOnWidgets().length).toBe(0);

    radioGroup.select('foo');

    expect(getOnWidgets().length).toBe(1);

    expect(radioGroup.getOptions()).toEqual(['foo', 'bar', 'foo', 'qux']);

    const onValues = radioGroup.acroField
      .getWidgets()
      .map((w) => w.getOnValue());

    expect(onValues).toEqual([
      PDFName.of('0'),
      PDFName.of('1'),
      PDFName.of('2'),
      PDFName.of('3'),
    ]);

    const opt = radioGroup.acroField.Opt() as PDFArray;
    expect(opt).toBeInstanceOf(PDFArray);
    expect(opt.size()).toBe(4);
    expect((opt.get(0) as PDFHexString).decodeText()).toBe('foo');
    expect((opt.get(1) as PDFHexString).decodeText()).toBe('bar');
    expect((opt.get(2) as PDFHexString).decodeText()).toBe('foo');
    expect((opt.get(3) as PDFHexString).decodeText()).toBe('qux');
  });

  it(`supports mutualExclusion=false`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const form = pdfDoc.getForm();

    const radioGroup = form.createRadioGroup('test.group');
    radioGroup.disableMutualExclusion();

    radioGroup.addOptionToPage('foo', page);
    radioGroup.addOptionToPage('bar', page);
    radioGroup.addOptionToPage('foo', page);
    radioGroup.addOptionToPage('qux', page);

    const getOnWidgets = () =>
      radioGroup.acroField
        .getWidgets()
        .filter((w) => w.getOnValue() === radioGroup.acroField.getValue());

    expect(getOnWidgets().length).toBe(0);

    radioGroup.select('foo');

    expect(getOnWidgets().length).toBe(2);

    expect(radioGroup.getOptions()).toEqual(['foo', 'bar', 'foo', 'qux']);

    const onValues = radioGroup.acroField
      .getWidgets()
      .map((w) => w.getOnValue());

    expect(onValues).toEqual([
      PDFName.of('0'),
      PDFName.of('1'),
      PDFName.of('0'),
      PDFName.of('3'),
    ]);

    const opt = radioGroup.acroField.Opt() as PDFArray;
    expect(opt).toBeInstanceOf(PDFArray);
    expect(opt.size()).toBe(4);
    expect((opt.get(0) as PDFHexString).decodeText()).toBe('foo');
    expect((opt.get(1) as PDFHexString).decodeText()).toBe('bar');
    expect((opt.get(2) as PDFHexString).decodeText()).toBe('foo');
    expect((opt.get(3) as PDFHexString).decodeText()).toBe('qux');
  });

  it(`produces printable widgets when added to a page`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const radioGroup = form.createRadioGroup('a.new.radio.group');

    const widgets = () => radioGroup.acroField.getWidgets();
    expect(widgets().length).toBe(0);

    radioGroup.addOptionToPage('foo', page);
    expect(widgets().length).toBe(1);
    expect(widgets()[0].hasFlag(AnnotationFlags.Print)).toBe(true);
  });

  it(`sets page reference when added to a page`, async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const form = pdfDoc.getForm();

    const radioGroup = form.createRadioGroup('a.new.radio.group');

    const widgets = () => radioGroup.acroField.getWidgets();
    expect(widgets().length).toBe(0);

    radioGroup.addOptionToPage('foo', page);
    expect(widgets().length).toBe(1);
    expect(widgets()[0].P()).toBe(page.ref);
  });
});
