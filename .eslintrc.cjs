module.exports = {
  root: true,
  ignorePatterns: ['dev-dist/', 'dist/', 'node_modules/'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: { react: { version: 'detect' } },
  rules: {
    // project-level overrides can be added here
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: { project: './tsconfig.json' }
    }
  ]
}
