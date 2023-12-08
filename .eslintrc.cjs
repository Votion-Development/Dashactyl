module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'arrow-spacing': [
			'warn',
			{
				'before': true,
				'after': true
			}
		],
		'brace-style': [
			'error',
			'stroustrup',
			{
				'allowSingleLine': true
			}
		],
		'comma-dangle': [
			'error',
			'always-multiline'
		],
		'comma-spacing': 'error',
		'comma-style': 'error',
		'curly': [
			'error',
			'multi-line',
			'consistent'
		],
		'dot-location': [
			'error',
			'property'
		],
		'handle-callback-err': 'off',
		'indent': [
			'error',
			'tab'
		],
		'keyword-spacing': 'error',
		'max-nested-callbacks': [
			'error',
			{
				'max': 4
			}
		],
		'max-statements-per-line': [
			'error',
			{
				'max': 2
			}
		],
		'no-console': 'off',
		'no-empty-function': 'error',
		'no-floating-decimal': 'error',
		'no-inline-comments': 'error',
		'no-lonely-if': 'error',
		'no-multi-spaces': 'error',
		'no-multiple-empty-lines': [
			'error',
			{
				'max': 2,
				'maxEOF': 1,
				'maxBOF': 0
			}
		],
		'no-shadow': [
			'error',
			{
				'allow': [
					'err',
					'resolve',
					'reject'
				]
			}
		],
		'no-trailing-spaces': [
			'error'
		],
		'no-var': 'error',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				'argsIgnorePattern': '^_',
				'destructuredArrayIgnorePattern': '^_',
				'varsIgnorePattern': '^_'
			}
		],
		'no-unused-vars': 'off',
		'object-curly-spacing': [
			'error',
			'always'
		],
		'prefer-const': 'error',
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'space-before-blocks': 'error',
		'space-before-function-paren': [
			'error',
			{
				'anonymous': 'never',
				'named': 'never',
				'asyncArrow': 'always'
			}
		],
		'space-in-parens': 'error',
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		'spaced-comment': 'error',
		'yoda': 'error'
  },
}
