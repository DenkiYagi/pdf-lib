import { Ascii85Stream } from 'src/core/streams/Ascii85Stream';
import { Stream } from 'src/core/streams/Stream';
import { readBinaryFileSync } from '../../test-utils';

const DIR = `tests/core/streams/data/ascii85`;
const FILES = ['1'];

describe(`Ascii85Stream`, () => {
  FILES.forEach((file) => {
    it(`can decode ascii 85 encoded data (${file})`, () => {
      const encoded = readBinaryFileSync(`${DIR}/${file}.encoded`);
      const decoded = readBinaryFileSync(`${DIR}/${file}.decoded`);

      const stream = new Ascii85Stream(new Stream(encoded));

      expect(stream.decode()).toEqual(decoded);
    });
  });
});
