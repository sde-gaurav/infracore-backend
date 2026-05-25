'use strict';

module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ['airbnb-base', 'plugin:jest/recommended'],
  plugins: ['import', 'jest'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Enforce consistent module style
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', 'src/tests/**'] }],
    'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],

    // Disable rules that clash with our project conventions
    'no-underscore-dangle': ['error', { allow: ['_id', '__v', '_doc'] }],
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['req', 'res', 'next', 'acc', 'accumulator'] }],
    'class-methods-use-this': 'off',
    'no-console': 'error',

    // Prefer named exports for better treeshaking in future
    'import/prefer-default-export': 'off',

    // Allow async iterators
    'no-restricted-syntax': [
      'error',
      { selector: 'LabeledStatement', message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.' },
      { selector: 'WithStatement', message: '`with` is disallowed in strict mode because it makes the code impossible to predict and optimise.' },
    ],

    // Modern JS
    'prefer-destructuring': ['error', { object: true, array: false }],
    'object-curly-newline': 'off',

    // Jest
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',

    // Style
    'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'arrow-body-style': ['error', 'as-needed'],
    'consistent-return': 'off',
  },
  overrides: [
    {
      files: ['src/tests/**/*.test.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
