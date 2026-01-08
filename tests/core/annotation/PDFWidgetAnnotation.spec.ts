import { PDFContext } from 'src/core/PDFContext.js';
import { PDFWidgetAnnotation } from 'src/core/annotation/PDFWidgetAnnotation.js';
import { PDFHexString } from 'src/core/objects/PDFHexString.js';
import { PDFName } from 'src/core/objects/PDFName.js';
import { PDFNull } from 'src/core/objects/PDFNull.js';
import { PDFString } from 'src/core/objects/PDFString.js';

describe(`PDFWidgetAnnotation`, () => {
  it(`returns undefined for missing (DAs)`, () => {
    const context = PDFContext.create();

    const parentRef = context.nextRef();
    const widget = PDFWidgetAnnotation.create(context, parentRef);
    widget.dict.set(PDFName.of('DA'), PDFNull);

    expect(widget.getDefaultAppearance()).toBe(undefined);
  });

  it(`returns normal direct appearance strings (DAs)`, () => {
    const context = PDFContext.create();

    const parentRef = context.nextRef();
    const widget = PDFWidgetAnnotation.create(context, parentRef);
    widget.dict.set(PDFName.of('DA'), PDFString.of('/ZaDb 10 Tf 0 g'));

    expect(widget.getDefaultAppearance()).toBe('/ZaDb 10 Tf 0 g');
  });

  it(`returns hexadecimal (non-standard) direct appearance strings (DAs)`, () => {
    const context = PDFContext.create();

    const parentRef = context.nextRef();
    const widget = PDFWidgetAnnotation.create(context, parentRef);
    widget.dict.set(PDFName.of('DA'), PDFHexString.fromText('/ZaDb 10 Tf 0 g'));

    expect(widget.getDefaultAppearance()).toBe('/ZaDb 10 Tf 0 g');
  });
});
