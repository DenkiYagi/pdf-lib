import { PDFHeader } from 'src/core/document/PDFHeader';
import { PDFTrailer } from 'src/core/document/PDFTrailer';
import { PDFInvalidObject } from 'src/core/objects/PDFInvalidObject';
import { PDFName } from 'src/core/objects/PDFName';
import { PDFNumber } from 'src/core/objects/PDFNumber';
import type { PDFObject } from 'src/core/objects/PDFObject';
import { PDFRef } from 'src/core/objects/PDFRef';
import { PDFStream } from 'src/core/objects/PDFStream';
import type { PDFContext } from 'src/core/PDFContext';
import { PDFCrossRefStream } from 'src/core/structures/PDFCrossRefStream';
import { PDFObjectStream } from 'src/core/structures/PDFObjectStream';
import { PDFWriter } from 'src/core/writers/PDFWriter';
import { last, waitForTick } from 'src/utils';

export class PDFStreamWriter extends PDFWriter {
  static forContext = (
    context: PDFContext,
    objectsPerTick: number,
    encodeStreams = true,
    objectsPerStream = 50,
  ) =>
    new PDFStreamWriter(
      context,
      objectsPerTick,
      encodeStreams,
      objectsPerStream,
    );

  private readonly encodeStreams: boolean;
  private readonly objectsPerStream: number;

  private constructor(
    context: PDFContext,
    objectsPerTick: number,
    encodeStreams: boolean,
    objectsPerStream: number,
  ) {
    super(context, objectsPerTick);

    this.encodeStreams = encodeStreams;
    this.objectsPerStream = objectsPerStream;
  }

  protected async computeBufferSize() {
    let objectNumber = this.context.largestObjectNumber + 1;

    const header = PDFHeader.forVersion(1, 7);

    let size = header.sizeInBytes() + 2;

    const xrefStream = PDFCrossRefStream.create(
      this.createTrailerDict(),
      this.encodeStreams,
    );

    const uncompressedObjects: [PDFRef, PDFObject][] = [];
    const compressedObjects: [PDFRef, PDFObject][][] = [];
    const objectStreamRefs: PDFRef[] = [];

    const indirectObjects = this.context.enumerateIndirectObjects();
    const encryptionKey = this.context.security?.encryptionKey;

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const indirectObject = indirectObjects[idx];
      const [ref, object] = indirectObject;

      /**
       * `true` if the object shall not be stored in an object stream
       * (see ISO 32000-1 > 7.5.7. Object streams).
       * 
       * Additional remarks:
       * - According to the implementation of PDFBox, the `Root` shall also not be stored
       *   in an object stream (especially if you're going to encrypt the PDF document;
       *   otherwise you won't be able to open the encrypted PDF with Adobe Acrobat Reader).
       * - The value of `Length` entry in an object stream shall not be stored in another
       *   object stream. However in our implementation the `Length` entry of a stream is
       *   always a direct object, so it will never appear here.
       * - In linearized files, some other objects shall also not be stored in an object stream.
       *   However we don't support linearization for now.
       */
      const shouldNotCompress =
        ref === this.context.trailerInfo.Encrypt ||
        ref === this.context.trailerInfo.Root ||
        object instanceof PDFStream ||
        object instanceof PDFInvalidObject ||
        ref.generationNumber !== 0;

      if (shouldNotCompress) {
        if (encryptionKey != null)
          encryptionKey.encryptIfPossible(indirectObject);

        uncompressedObjects.push(indirectObject);
        xrefStream.addUncompressedEntry(ref, size);
        size += this.computeIndirectObjectSize(indirectObject);
        if (this.shouldWaitForTick(1)) await waitForTick();
      } else {
        let chunk = last(compressedObjects);
        let objectStreamRef = last(objectStreamRefs);
        if (!chunk || chunk.length % this.objectsPerStream === 0) {
          chunk = [];
          compressedObjects.push(chunk);
          objectStreamRef = PDFRef.of(objectNumber++);
          objectStreamRefs.push(objectStreamRef);
        }
        xrefStream.addCompressedEntry(ref, objectStreamRef, chunk.length);
        chunk.push(indirectObject);
      }
    }

    for (let idx = 0, len = compressedObjects.length; idx < len; idx++) {
      const chunk = compressedObjects[idx];
      const ref = objectStreamRefs[idx];

      const objectStream = PDFObjectStream.withContextAndObjects(
        this.context,
        chunk,
        this.encodeStreams,
      );
      const indirectObject: [PDFRef, PDFObject] = [ref, objectStream];
      if (encryptionKey != null)
        encryptionKey.encryptIfPossible(indirectObject);

      xrefStream.addUncompressedEntry(ref, size);
      size += this.computeIndirectObjectSize(indirectObject);

      uncompressedObjects.push(indirectObject);

      if (this.shouldWaitForTick(chunk.length)) await waitForTick();
    }

    const xrefStreamRef = PDFRef.of(objectNumber++);
    xrefStream.dict.set(PDFName.of('Size'), PDFNumber.of(objectNumber));
    xrefStream.addUncompressedEntry(xrefStreamRef, size);
    const xrefOffset = size;
    size += this.computeIndirectObjectSize([xrefStreamRef, xrefStream]);

    uncompressedObjects.push([xrefStreamRef, xrefStream]);

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();

    return { size, header, indirectObjects: uncompressedObjects, trailer };
  }
}
