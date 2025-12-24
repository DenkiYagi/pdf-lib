import type { PDFDict } from 'src/core/objects/PDFDict.js';
import { PDFAcroButton } from 'src/core/acroform/PDFAcroButton.js';
import type { PDFContext } from 'src/core/PDFContext.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';
import { AcroButtonFlags } from 'src/core/acroform/flags.js';

export class PDFAcroPushButton extends PDFAcroButton {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroPushButton(dict, ref);

  static create = (context: PDFContext) => {
    const dict = context.obj({
      FT: 'Btn',
      Ff: AcroButtonFlags.PushButton,
      Kids: [],
    });
    const ref = context.register(dict);
    return new PDFAcroPushButton(dict, ref);
  };
}
