import { FlateStream } from '../../../src/core/streams/FlateStream.js';
import { Stream } from '../../../src/core/streams/Stream.js';
import { readBinaryFileSync } from '../../test-utils.js';

const DIR = `tests/core/streams/data/flate`;
const FILES = ['1', '2', '3', '4', '5', '6', '7'];

describe(`FlateStream`, () => {
  FILES.forEach((file) => {
    it(`can decode flate encoded data (${file})`, () => {
      const encoded = readBinaryFileSync(`${DIR}/${file}.encoded`);
      const decoded = readBinaryFileSync(`${DIR}/${file}.decoded`);

      const stream = new FlateStream(new Stream(encoded));

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
