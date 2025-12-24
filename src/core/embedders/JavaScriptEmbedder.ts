import { PDFHexString } from 'src/core/objects/PDFHexString.js';
import type { PDFContext } from 'src/core/PDFContext.js';
import type { PDFRef } from 'src/core/objects/PDFRef.js';

export class JavaScriptEmbedder {
  static for(script: string, scriptName: string) {
    return new JavaScriptEmbedder(script, scriptName);
  }

  private readonly script: string;
  readonly scriptName: string;

  private constructor(script: string, scriptName: string) {
    this.script = script;
    this.scriptName = scriptName;
  }

  async embedIntoContext(context: PDFContext, ref?: PDFRef): Promise<PDFRef> {
    const jsActionDict = context.obj({
      Type: 'Action',
      S: 'JavaScript',
      JS: PDFHexString.fromText(this.script),
    });

    if (ref) {
      context.assign(ref, jsActionDict);
      return ref;
    } else {
      return context.register(jsActionDict);
    }
  }
}
