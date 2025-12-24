import type { PDFDict } from 'src/core/objects/PDFDict.js';
import { PDFAcroChoice } from 'src/core/acroform/PDFAcroChoice.js';
import type { PDFContext } from 'src/core/PDFContext.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';
import { AcroChoiceFlags } from 'src/core/acroform/flags.js';

export class PDFAcroComboBox extends PDFAcroChoice {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroComboBox(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Ch',
      Ff: AcroChoiceFlags.Combo,
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroComboBox(dict, ref);
  };
}
