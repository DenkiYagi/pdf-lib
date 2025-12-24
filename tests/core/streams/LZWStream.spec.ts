import { LZWStream } from 'src/core/streams/LZWStream.js';
import { Stream } from 'src/core/streams/Stream.js';
import { readBinaryFileSync } from '../../test-utils.js';

const DIR = `tests/core/streams/data/lzw`;
const FILES = ['1', '2', '3', '4'];

describe(`LZWStream`, () => {
  FILES.forEach((file) => {
    it(`can decode LZW encoded data (${file})`, () => {
      const encoded = readBinaryFileSync(`${DIR}/${file}.encoded`);
      const decoded = readBinaryFileSync(`${DIR}/${file}.decoded`);

      const stream = new LZWStream(new Stream(encoded), undefined, 0);

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
