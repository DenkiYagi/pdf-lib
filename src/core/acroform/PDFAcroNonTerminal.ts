import type { PDFDict } from '../objects/PDFDict.js';
import type { PDFRef } from '../objects/PDFRef.js';
import { PDFName } from '../objects/PDFName.js';
import type { PDFContext } from '../PDFContext.js';
import { PDFAcroField } from './PDFAcroField.js';

export class PDFAcroNonTerminal extends PDFAcroField {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroNonTerminal(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({});
    const ref = context.register(dict);
    return new PDFAcroNonTerminal(dict, ref);
  };

  addField(field: PDFRef) {
    const { Kids } = this.normalizedEntries();
    Kids?.push(field);
  }

  normalizedEntries() {
    let Kids = this.Kids();

    if (!Kids) {
      Kids = this.dict.context.obj([]);
      this.dict.set(PDFName.of('Kids'), Kids);
    }

    return { Kids };
  }
}
