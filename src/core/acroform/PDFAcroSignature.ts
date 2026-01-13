import type { PDFDict } from '../objects/PDFDict.js';
import type { PDFRef } from '../objects/PDFRef.js';
import { PDFAcroTerminal } from './PDFAcroTerminal.js';

export class PDFAcroSignature extends PDFAcroTerminal {
  static fromDict = (dict: PDFDict, ref: PDFRef) =>
    new PDFAcroSignature(dict, ref);
}
