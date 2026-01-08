// Build-only barrel for the UMD bundle; do not import from this in source code.

export * from 'src/core/error-base.js';
export * from 'src/core/errors.js';
export { CharCodes } from 'src/core/syntax/CharCodes.js';

export { PDFContext } from 'src/core/PDFContext.js';
export { PDFObjectCopier } from 'src/core/PDFObjectCopier.js';
export { PDFWriter } from 'src/core/writers/PDFWriter.js';
export { PDFStreamWriter } from 'src/core/writers/PDFStreamWriter.js';

export { PDFHeader } from 'src/core/document/PDFHeader.js';
export { PDFTrailer } from 'src/core/document/PDFTrailer.js';
export { PDFTrailerDict } from 'src/core/document/PDFTrailerDict.js';
export { PDFCrossRefSection } from 'src/core/document/PDFCrossRefSection.js';

export { StandardFontEmbedder } from 'src/core/embedders/StandardFontEmbedder.js';
export { AbstractCustomFontEmbedder } from 'src/core/embedders/AbstractCustomFontEmbedder.js';
export { CustomFontEmbedder } from 'src/core/embedders/CustomFontEmbedder.js';
export { CustomFontSubsetEmbedder } from 'src/core/embedders/CustomFontSubsetEmbedder.js';
export {
  FileEmbedder,
  AFRelationship,
} from 'src/core/embedders/FileEmbedder.js';
export { JpegEmbedder } from 'src/core/embedders/JpegEmbedder.js';
export { PngEmbedder } from 'src/core/embedders/PngEmbedder.js';
export { PDFPageEmbedder } from 'src/core/embedders/PDFPageEmbedder.js';
export type { PageBoundingBox } from 'src/core/embedders/PDFPageEmbedder.js';
export { BasicPresetShaper } from 'src/core/embedders/shapers/BasicPresetShaper.js';
export { HorizontalPresetShaper } from 'src/core/embedders/shapers/HorizontalPresetShaper.js';
export { VerticalPresetShaper } from 'src/core/embedders/shapers/VerticalPresetShaper.js';

export {
  ViewerPreferences,
  NonFullScreenPageMode,
  ReadingDirection,
  PrintScaling,
  Duplex,
} from 'src/core/interactive/ViewerPreferences.js';

export { PDFObject } from 'src/core/objects/PDFObject.js';
export { PDFBool } from 'src/core/objects/PDFBool.js';
export { PDFNumber } from 'src/core/objects/PDFNumber.js';
export { PDFString } from 'src/core/objects/PDFString.js';
export { PDFHexString } from 'src/core/objects/PDFHexString.js';
export { PDFName } from 'src/core/objects/PDFName.js';
export { PDFNull } from 'src/core/objects/PDFNull.js';
export { PDFArray } from 'src/core/objects/PDFArray.js';
export { PDFDict } from 'src/core/objects/PDFDict.js';
export { PDFRef } from 'src/core/objects/PDFRef.js';
export { PDFInvalidObject } from 'src/core/objects/PDFInvalidObject.js';
export { PDFStream } from 'src/core/objects/PDFStream.js';
export { PDFRawStream } from 'src/core/objects/PDFRawStream.js';

export { PDFCatalog } from 'src/core/structures/PDFCatalog.js';
export { PDFContentStream } from 'src/core/structures/PDFContentStream.js';
export { PDFCrossRefStream } from 'src/core/structures/PDFCrossRefStream.js';
export { PDFObjectStream } from 'src/core/structures/PDFObjectStream.js';
export { PDFPageTree } from 'src/core/structures/PDFPageTree.js';
export { PDFPageLeaf } from 'src/core/structures/PDFPageLeaf.js';
export { PDFFlateStream } from 'src/core/structures/PDFFlateStream.js';

export { PDFOperator } from 'src/core/operators/PDFOperator.js';
export { PDFOperatorNames } from 'src/core/operators/PDFOperatorNames.js';

export { PDFObjectParser } from 'src/core/parser/PDFObjectParser.js';
export { PDFObjectStreamParser } from 'src/core/parser/PDFObjectStreamParser.js';
export { PDFParser } from 'src/core/parser/PDFParser.js';
export { PDFXRefStreamParser } from 'src/core/parser/PDFXRefStreamParser.js';

export { decodePDFRawStream } from 'src/core/streams/decode.js';

export * from 'src/core/annotation/index.js';
export * from 'src/core/acroform/index.js';
