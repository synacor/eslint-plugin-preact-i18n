import RuleTester from 'eslint/lib/testers/rule-tester';
import rule from '../../../src/rules/no-missing-template-field';

const settings = {
	'preact-i18n': {
		languageFiles: [
			{
				name: 'en',
				path: 'test/i18n/en.json'
			}
		],
		textComponents: [
			{ nameRegex: '^Text$' },
			{ nameRegex: '^Dialog$', id: 'title', plural: 'count', fields: 'data' }
		],
		markupTextComponents: [
			{ nameRegex: '^MarkupText$' },
			{ nameRegex: '^DialogMarkup$', id: 'title', plural: 'count', fields: 'data' }
		],
		withTextRegex: '^withText(?:Alias)?$'
	}
};

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6,
		ecmaFeatures: {
			jsx: true
		}
	},
	settings
});


ruleTester.run('no-missing-template-field', rule, {
	valid: [
		{ code: '<Text id="helloWorld" />' },
		{ code: '<Text {...props} />' },
		{ code: '<Text id="templated" fields={{foo: "bar"}} />' },
		{ code: '<Dialog title="templated" data={{foo: "bar"}} />' },
		{ code: '<DialogMarkup title="templated" data={{foo: "bar"}} />' },
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
			code: '<Text id="nested" fields={{foo: "bar"}} />',
			settings: {
				'preact-i18n': {
					...settings['preact-i18n'],
					scopes: ['parent']
				}
			},
			errors: [
				{
					message: "'nested' doesn't require any template field data.",
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
			code: '<Dialog title="templated" />',
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
			code: '<DialogMarkup title="templated" />',
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
			code: '<Dialog title="pluralizedArray" data={{foo: "bar"}} count={3} />',
			errors: [
				{
					message: "'pluralizedArray' doesn't require any template field data.",
					type: 'JSXElement'
				}
			]
		},
		{
			code: '<DialogMarkup title="pluralizedArray" data={{foo: "bar"}} count={3} />',
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
