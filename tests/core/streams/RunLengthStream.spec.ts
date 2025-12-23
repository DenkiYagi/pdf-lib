import { RunLengthStream } from 'src/core/streams/RunLengthStream.js';
import { Stream } from 'src/core/streams/Stream.js';
import { readBinaryFileSync } from '../../test-utils.js';

const DIR = `tests/core/streams/data/runlength`;
const FILES = ['1', '2', '3', '4', '5'];

describe(`RunLengthStream`, () => {
  FILES.forEach((file) => {
    it(`can decode run length encoded data (${file})`, () => {
      const encoded = readBinaryFileSync(`${DIR}/${file}.encoded`);
      const decoded = readBinaryFileSync(`${DIR}/${file}.decoded`);

      const stream = new RunLengthStream(new Stream(encoded));

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
