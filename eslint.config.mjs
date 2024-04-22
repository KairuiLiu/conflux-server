import globals, { es2021 } from 'globals';
import tseslint from 'typescript-eslint';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  {
    languageOptions: { globals: globals.node },
    env: { node: true, es2021: true },
    parser: '@typescript-eslint/parser',
  },
  ...compat.extends('standard-with-typescript'),
  ...tseslint.configs.recommended,
];
