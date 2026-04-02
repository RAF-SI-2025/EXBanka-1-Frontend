import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist', 'src/components/ui']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // Allow require() in jest.mock() factory callbacks inside test files
  {
    files: ['**/*.test.{ts,tsx}', 'src/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Cypress test files: allow namespace augmentation and any types
  {
    files: ['cypress/**/*.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
])
