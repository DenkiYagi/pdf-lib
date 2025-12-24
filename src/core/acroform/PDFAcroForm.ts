import type { PDFContext } from 'src/core/PDFContext.js';
import { PDFDict } from 'src/core/objects/PDFDict.js';
import { PDFArray } from 'src/core/objects/PDFArray.js';
import { PDFName } from 'src/core/objects/PDFName.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';
import type { PDFAcroField } from 'src/core/acroform/PDFAcroField.js';
import { PDFAcroNonTerminal } from 'src/core/acroform/PDFAcroNonTerminal.js';
import {
  createPDFAcroField,
  createPDFAcroFields,
} from 'src/core/acroform/utils.js';
import { MissingAcroFormFieldError } from 'src/core/errors.js';

export class PDFAcroForm {
  readonly dict: PDFDict;

  static fromDict = (dict: PDFDict) => new PDFAcroForm(dict);

  static create = (context: PDFContext) => {
    const dict = context.obj({ Fields: [] });
    return new PDFAcroForm(dict);
  };

  private constructor(dict: PDFDict) {
    this.dict = dict;
  }

  Fields(): PDFArray | undefined {
    const fields = this.dict.lookup(PDFName.of('Fields'));
    if (fields instanceof PDFArray) return fields;
    return undefined;
  }

  getFields(): [PDFAcroField, PDFRef][] {
    const { Fields } = this.normalizedEntries();

    const fields = new Array(Fields.size());
    for (let idx = 0, len = Fields.size(); idx < len; idx++) {
      const ref = Fields.get(idx) as PDFRef;
      const dict = Fields.lookup(idx, PDFDict);
      fields[idx] = [createPDFAcroField(dict, ref), ref];
    }

    return fields;
  }

  getAllFields(): [PDFAcroField, PDFRef][] {
    const allFields: [PDFAcroField, PDFRef][] = [];

    const pushFields = (fields?: [PDFAcroField, PDFRef][]) => {
      if (!fields) return;
      for (let idx = 0, len = fields.length; idx < len; idx++) {
        const field = fields[idx];
        allFields.push(field);
        const [fieldModel] = field;
        if (fieldModel instanceof PDFAcroNonTerminal) {
          pushFields(createPDFAcroFields(fieldModel.Kids()));
        }
      }
    };

    pushFields(this.getFields());

    return allFields;
  }

  addField(field: PDFRef) {
    const { Fields } = this.normalizedEntries();
    Fields?.push(field);
  }

  removeField(field: PDFAcroField): void {
    const parent = field.getParent();
    const fields =
      parent === undefined ? this.normalizedEntries().Fields : parent.Kids();

    const index = fields?.indexOf(field.ref);
    if (fields === undefined || index === undefined) {
      const fieldName = field.getFullyQualifiedName() ?? '<unknown field>';
      throw new MissingAcroFormFieldError(fieldName);
    }

    fields.remove(index);

    if (parent !== undefined && fields.size() === 0) {
      this.removeField(parent);
    }
  }

  normalizedEntries() {
    let Fields = this.Fields();

    if (!Fields) {
      Fields = this.dict.context.obj([]);
      this.dict.set(PDFName.of('Fields'), Fields);
    }

    return { Fields };
  }
}
