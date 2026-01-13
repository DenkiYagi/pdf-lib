import type { PDFDict } from '../objects/PDFDict.js';
import { PDFAcroChoice } from './PDFAcroChoice.js';
import type { PDFContext } from '../PDFContext.js';
import type { PDFRef } from '../objects/PDFRef.js';

export class PDFAcroListBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroListBox(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Ch',
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroListBox(dict, ref);
  };
}
