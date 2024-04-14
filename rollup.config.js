import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  external: ['express', 'socket.io'],
  plugins: [
    json(),
    resolve({
      preferBuiltins: true,
      extensions: ['.js', '.ts'],
    }),
    typescript({ tsconfig: './tsconfig.json', outputToFilesystem: true }),
    commonjs(),
  ],
};
