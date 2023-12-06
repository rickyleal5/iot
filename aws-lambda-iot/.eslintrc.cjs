module.exports = {
    env: {
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        quotes: ['error', 'single'],
        indent: ['error', 4],
        semi: ['error', 'always'],
        'arrow-spacing': ['error', { before: true, after: true }],
        'comma-dangle': ['error', 'never'],
        'max-len': ['error', { code: 160 }]
    }
};
