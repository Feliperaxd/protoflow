module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: ['airbnb-base'],
  rules: {
    'max-len': ['error', { code: 100 }],
    'no-console': 'off',
    indent: ['error', 2],
    'import/extensions': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
  },
};
