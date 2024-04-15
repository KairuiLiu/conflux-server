import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  external: ['express', 'socket.io'],
  plugins: [
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(
            dirname(fileURLToPath(import.meta.url)),
            'src',
          ),
        },
      ],
    }),
    json(),
    resolve({
      preferBuiltins: true,
      extensions: ['.js', '.ts'],
    }),
    typescript({ tsconfig: './tsconfig.json', outputToFilesystem: true }),
    commonjs(),
  ],
};
