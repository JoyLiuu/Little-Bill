import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts'],
  },
]
