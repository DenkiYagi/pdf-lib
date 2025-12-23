import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'dist/es/all.js',
  output: [
    {
      file: 'dist/umd/pdf-lib.js',
      name: 'PDFLib',
      format: 'umd',
      sourcemap: true,
    },
    {
      file: 'dist/umd/pdf-lib.min.js',
      name: 'PDFLib',
      format: 'umd',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [nodeResolve(), commonjs(), json()],
};
