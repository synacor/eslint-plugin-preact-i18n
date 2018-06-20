const RuleTester = require('eslint/lib/testers/rule-tester');
const rule = require('../../../src/rules/no-missing-template-field');

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6,
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		'preact-i18n': {
			languageFiles: [
				{
					name: 'en',
					path: 'test/i18n/en.json'
				}
			],
			textComponentRegex: '^Text(?:Alias)?$',
			markupTextComponentRegex: '^MarkupText(?:Alias)?$',
			withTextRegex: '^withText(?:Alias)?$'
		}
	}
});


ruleTester.run('no-missing-template-field', rule, {
	valid: [
		{ code: '<Text id="helloWorld" />' },
		{ code: '<Text {...props} />' },
		{ code: '<Text id="templated" fields={{foo: "bar"}} />' },
		{ code: '<Text id="templated" />', settings: { 'preact-i18n': { ignoreFiles: '**/*.spec.js' } }, filename: 'blah/foo.spec.js' },
		{ code: '<Text id="pluralizedAndtemplated" fields={{foo: "bar"}} plural={3}/>' },
		{ code: '<MarkupText id="templated" fields={{foo: "bar"}} />' },
		{ code: '<NotALocalizedComponent id="templated" />' }
	],
	invalid: [
		{
			code: '<Text id="helloWorld" fields={{foo: "bar"}} />',
			errors: [
				{
					message: "'helloWorld' doesn't require any template field data.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<Text id="templated" />',
			errors: [
				{
					message: "'templated' has template fields but no fields attribute.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<TextAlias id="templated" />',
			errors: [
				{
					message: "'templated' has template fields but no fields attribute.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<MarkupText id="templated" />',
			errors: [
				{
					message: "'templated' has template fields but no fields attribute.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<MarkupTextAlias id="templated" />',
			errors: [
				{
					message: "'templated' has template fields but no fields attribute.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<Text id="pluralizedArray" fields={{foo: "bar"}} plural={3} />',
			errors: [
				{
					message: "'pluralizedArray' doesn't require any template field data.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<Text id="pluralizedAndtemplated" plural={3} />',
			errors: [
				{
					message: "'pluralizedAndtemplated' has template fields but no fields attribute.",
					type: 'JSXElement'
				}
			]
		}
	]
});
