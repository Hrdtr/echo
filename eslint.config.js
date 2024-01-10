import antfu from '@antfu/eslint-config'

export default await antfu({
  rules: {
    'antfu/if-newline': 'off',
    'node/prefer-global/process': 'off',
    'style/max-statements-per-line': ['error', { max: 2 }],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
  },
})
