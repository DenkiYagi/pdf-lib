import { readFileSync, type PathLike } from 'fs';
import { readFile } from 'fs/promises';

export function readBinaryFileSync(path: PathLike): Uint8Array {
    return new Uint8Array(readFileSync(path));
}

export async function readBinaryFile(path: PathLike): Promise<Uint8Array> {
    const data = await readFile(path);
    return new Uint8Array(data);
}
