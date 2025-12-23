import type { PDFDict } from 'src/core/objects/PDFDict.js';
import { PDFName } from 'src/core/objects/PDFName.js';
import { PDFNumber } from 'src/core/objects/PDFNumber.js';

// TODO: Also handle the `/S` and `/D` entries
export class BorderStyle {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict): BorderStyle => new BorderStyle(dict);

  protected constructor(dict: PDFDict) {
    this.dict = dict;
  }

  W(): PDFNumber | undefined {
    const W = this.dict.lookup(PDFName.of('W'));
    if (W instanceof PDFNumber) return W;
    return undefined;
  }

  getWidth(): number | undefined {
    return this.W()?.asNumber() ?? 1;
  }

  setWidth(width: number) {
    const W = this.dict.context.obj(width);
    this.dict.set(PDFName.of('W'), W);
  }
}
