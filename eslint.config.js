// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
// Last so it turns off style rules that would fight Prettier; formatting runs apart with `pnpm format`.
const prettierConfig = require('eslint-config-prettier/flat');

// Architecture boundaries from AGENTS.md: each folder lists what it must not import.
const UI = ['**/components/**', '**/screens/**', '**/hooks/**'];
const boundaries = [
  {
    files: ['src/domain/**'],
    message:
      'El dominio son funciones puras: sin React, red, permisos ni almacenamiento.',
    patterns: [
      'react',
      'react-native',
      'expo*',
      '@react-native-async-storage/*',
      '**/storage/**',
      '**/weather/**',
      '**/ai/**',
      '**/theme/**',
      ...UI,
    ],
  },
  {
    files: ['src/storage/**', 'src/weather/**', 'src/ai/**', 'server/**'],
    message: 'Los adaptadores no dependen de la interfaz.',
    patterns: ['**/theme/**', ...UI],
  },
  {
    files: ['src/theme/**'],
    message:
      'El tema solo define colores de la interfaz; no decide vestuario ni guarda datos.',
    patterns: ['**/domain/**', '**/storage/**', ...UI],
  },
];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  ...boundaries.map(({ files, message, patterns }) => ({
    files,
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: patterns, message }] },
      ],
    },
  })),
  {
    // Front-end size limits: a screen or component should be readable in one pass.
    files: ['App.tsx', 'src/components/**', 'src/screens/**', 'src/hooks/**'],
    rules: {
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'react/no-unstable-nested-components': 'error',
    },
  },
]);
