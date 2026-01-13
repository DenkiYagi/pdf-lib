// Build-only barrel for the UMD bundle; do not import from this in source code.

export * from './error-base.js';
export * from './errors.js';
export { CharCodes } from './syntax/CharCodes.js';

export { PDFContext } from './PDFContext.js';
export { PDFObjectCopier } from './PDFObjectCopier.js';
export { PDFWriter } from './writers/PDFWriter.js';
export { PDFStreamWriter } from './writers/PDFStreamWriter.js';

export { PDFHeader } from './document/PDFHeader.js';
export { PDFTrailer } from './document/PDFTrailer.js';
export { PDFTrailerDict } from './document/PDFTrailerDict.js';
export { PDFCrossRefSection } from './document/PDFCrossRefSection.js';

export { StandardFontEmbedder } from './embedders/StandardFontEmbedder.js';
export { AbstractCustomFontEmbedder } from './embedders/AbstractCustomFontEmbedder.js';
export { CustomFontEmbedder } from './embedders/CustomFontEmbedder.js';
export { CustomFontSubsetEmbedder } from './embedders/CustomFontSubsetEmbedder.js';
export { FileEmbedder, AFRelationship } from './embedders/FileEmbedder.js';
export { JpegEmbedder } from './embedders/JpegEmbedder.js';
export { PngEmbedder } from './embedders/PngEmbedder.js';
export { PDFPageEmbedder } from './embedders/PDFPageEmbedder.js';
export type { PageBoundingBox } from './embedders/PDFPageEmbedder.js';
export { BasicPresetShaper } from './embedders/shapers/BasicPresetShaper.js';
export { HorizontalPresetShaper } from './embedders/shapers/HorizontalPresetShaper.js';
export { VerticalPresetShaper } from './embedders/shapers/VerticalPresetShaper.js';

export {
  ViewerPreferences,
  NonFullScreenPageMode,
  ReadingDirection,
  PrintScaling,
  Duplex,
} from './interactive/ViewerPreferences.js';

export { PDFObject } from './objects/PDFObject.js';
export { PDFBool } from './objects/PDFBool.js';
export { PDFNumber } from './objects/PDFNumber.js';
export { PDFString } from './objects/PDFString.js';
export { PDFHexString } from './objects/PDFHexString.js';
export { PDFName } from './objects/PDFName.js';
export { PDFNull } from './objects/PDFNull.js';
export { PDFArray } from './objects/PDFArray.js';
export { PDFDict } from './objects/PDFDict.js';
export { PDFRef } from './objects/PDFRef.js';
export { PDFInvalidObject } from './objects/PDFInvalidObject.js';
export { PDFStream } from './objects/PDFStream.js';
export { PDFRawStream } from './objects/PDFRawStream.js';

export { PDFCatalog } from './structures/PDFCatalog.js';
export { PDFContentStream } from './structures/PDFContentStream.js';
export { PDFCrossRefStream } from './structures/PDFCrossRefStream.js';
export { PDFObjectStream } from './structures/PDFObjectStream.js';
export { PDFPageTree } from './structures/PDFPageTree.js';
export { PDFPageLeaf } from './structures/PDFPageLeaf.js';
export { PDFFlateStream } from './structures/PDFFlateStream.js';

export { PDFOperator } from './operators/PDFOperator.js';
export { PDFOperatorNames } from './operators/PDFOperatorNames.js';

export { PDFObjectParser } from './parser/PDFObjectParser.js';
export { PDFObjectStreamParser } from './parser/PDFObjectStreamParser.js';
export { PDFParser } from './parser/PDFParser.js';
export { PDFXRefStreamParser } from './parser/PDFXRefStreamParser.js';

export { decodePDFRawStream } from './streams/decode.js';

export * from './annotation/index.js';
export * from './acroform/index.js';
