import type { PDFDict } from 'src/core/objects/PDFDict.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';
import { PDFAcroTerminal } from 'src/core/acroform/PDFAcroTerminal.js';

export class PDFAcroSignature extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroSignature(dict, ref);
}
