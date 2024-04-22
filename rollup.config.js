import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const dir = dirname(fileURLToPath(import.meta.url));
const dev = process.env.MODE === 'DEV';
const packageJSONPath = path.resolve(dir, 'package.json');
const packageInfo = JSON.parse(fs.readFileSync(packageJSONPath));

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: dev,
  },
  plugins: [
    !dev && del({ targets: 'dist' }),
    // directly replace the string in the code to avoid the pm2 only refreash .env
    replace({
      ROLLUP_REPLACE_BUILD_TIME: new Date().toISOString(),
      ROLLUP_REPLACE_BUILD_VERSION: packageInfo.version,
      preventAssignment: true,
    }),
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
      const distPath = path.resolve(dir, 'dist', 'package.json');
      const newPackageJson = {};
      Object.keys(packageInfo).forEach((key) => {
        if (!['devDependencies', 'dependencies', 'scripts'].includes(key)) {
          newPackageJson[key] = packageInfo[key];
        }
      });
      fs.writeFileSync(distPath, JSON.stringify(newPackageJson, null, 2));
    },
  };
}
