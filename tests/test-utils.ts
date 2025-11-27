import { readFileSync, type PathLike } from 'fs';
import { readFile } from 'fs/promises';

export const readBinaryFileSync = (path: PathLike): Uint8Array =>
  new Uint8Array(readFileSync(path));

export const readBinaryFile = async (path: PathLike): Promise<Uint8Array> => {
  const data = await readFile(path);
  return new Uint8Array(data);
};
