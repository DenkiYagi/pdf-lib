import { PDFHeader } from 'src/core/document/PDFHeader';
import { PDFTrailer } from 'src/core/document/PDFTrailer';
import { PDFName } from 'src/core/objects/PDFName';
import { PDFNumber } from 'src/core/objects/PDFNumber';
import type { PDFObject } from 'src/core/objects/PDFObject';
import { PDFRef } from 'src/core/objects/PDFRef';
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
      const [ref] = indirectObject;

      if (PDFObjectStream.shallNotStore(indirectObject, this.context)) {
        // Encrypt each object (which is not to be compressed) before computing size.
        if (encryptionKey != null) {
          encryptionKey.encryptIfPossible(indirectObject);
        }

        uncompressedObjects.push(indirectObject);
        xrefStream.addUncompressedEntry(ref, size);
        size += this.computeIndirectObjectSize(indirectObject);
        if (this.shouldWaitForTick(1)) await waitForTick();
      } else {
        // We don't encrypt the object here as it will be encrypted after storing in object stream.
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

      // Encrypt each object stream before computing size.
      if (encryptionKey != null) {
        encryptionKey.encryptIfPossible(indirectObject);
      }

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
