import type { PDFDict } from '../objects/PDFDict.js';
import { PDFAcroButton } from './PDFAcroButton.js';
import type { PDFContext } from '../PDFContext.js';
import type { PDFRef } from '../objects/PDFRef.js';
import { AcroButtonFlags } from './flags.js';

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
