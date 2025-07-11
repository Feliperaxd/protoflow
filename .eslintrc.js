module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['airbnb-base'],
    rules: {
        'max-len': ['error', { code: 100 }],
        'no-console': 'off',
        indent: ['error', 4],
        'import/extensions': 'off',
        'arrow-parens': ['error', 'as-needed'],
    },
};
