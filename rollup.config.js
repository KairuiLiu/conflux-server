import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const dir = dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV === 'DEV';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: dev,
  },
  plugins: [
    !dev && del({ targets: 'dist' }),
    alias({
      entries: [
        {
          find: '@',
          replacement: path.resolve(dir, 'src'),
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
    !dev && terser(),
    copy({
      targets: [
        { src: '.env', dest: 'dist' },
        !dev && { src: 'ecosystem.config.cjs', dest: 'dist' },
      ].filter(Boolean),
      hook: 'writeBundle',
    }),
    !dev && generatePackageJson(),
  ],
};

function generatePackageJson(options = {}) {
  return {
    name: 'generate-package-json',
    writeBundle() {
      const packagePath = path.resolve(dir, 'package.json');
      const distPath = path.resolve(dir, 'dist', 'package.json');
      const originalPackageJson = JSON.parse(fs.readFileSync(packagePath));
      const newPackageJson = {};
      Object.keys(originalPackageJson).forEach((key) => {
        if (!['devDependencies', 'dependencies', 'scripts'].includes(key)) {
          newPackageJson[key] = originalPackageJson[key];
        }
      });
      fs.writeFileSync(distPath, JSON.stringify(newPackageJson, null, 2));
    },
  };
}
