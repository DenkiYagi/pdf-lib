import { AsciiHexStream } from 'src/core/streams/AsciiHexStream';
import { Stream } from 'src/core/streams/Stream';
import { readBinaryFileSync } from '../../test-utils';

const DIR = `tests/core/streams/data/asciihex`;
const FILES = ['1', '2'];

describe(`AsciiHexStream`, () => {
  FILES.forEach((file) => {
    it(`can decode ascii hex encoded data (${file})`, () => {
      const encoded = readBinaryFileSync(`${DIR}/${file}.encoded`);
      const decoded = readBinaryFileSync(`${DIR}/${file}.decoded`);

      const stream = new AsciiHexStream(new Stream(encoded));

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
