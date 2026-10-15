// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const unusedImports = require('eslint-plugin-unused-imports');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'unused-imports': unusedImports },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
