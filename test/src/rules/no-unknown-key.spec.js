import RuleTester from 'eslint/lib/testers/rule-tester';
import rule from '../../../src/rules/no-unknown-key';

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


// const options = [];

ruleTester.run('no-unknown-key', rule, {
	valid: [
		{ code: '<Text id="helloWorld"/>' },
		{ code: '<Text id={"helloWorld"}/>' },
		{ code: '<Text id={prop.textId}/>' },
		{ code: '<Text {...props} />' },
		{ code: '<Dialog title="helloWorld"/>' },
		{ code: '<MarkupText id="helloWorld"/>' },
		{ code: '<DialogMarkup id="helloWorld"/>' },
		{ code: '<ShouldNotFlagForMissingKey id="foo"/>' },
		{ code: '<Text id="missingKeyButFileIgnored" />', settings: { 'preact-i18n': { ignoreFiles: '**/*.spec.js' } }, filename: 'blah/foo.spec.js' },
		{ code: '<Text id="pluralizedArray" plural="0" />' },
		{ code: '<Text id="pluralizedArray" plural="0" />' },
		{ code: '<Text id="pluralizedArray" plural="1" />' },
		{ code: '<Text id="pluralizedArray" plural="2" />' },
		{ code: '<Text id="pluralizedNoneOneMany" plural="0" />' },
		{ code: '<Text id="pluralizedNoneOneMany" plural="1" />' },
		{ code: '<Text id="pluralizedNoneOneMany" plural="2" />' },
		{ code: '<Text id="pluralizedPluralSingular" plural="0" />' },
		{ code: '<Text id="pluralizedPluralSingular" plural="1" />' },
		{ code: '<Text id="pluralizedPluralSingular" plural="2" />' },
		{ code: '<Dialog title="pluralizedPluralSingular" count="0" />' },
		{ code: '<DialogMarkup title="pluralizedPluralSingular" count="0" />' },
		{ code: '<Text id="badPluralizedPluralSingular" plural={1}/>', options: [{ ignorePluralFormat: true }] },
		{ code: '<Text id="nested" />', settings: { 'preact-i18n': { ...settings['preact-i18n'], scopes: ['parent'] } } },
		{ code: 'withText("helloWorld,parent.nested")' },
		{ code: 'withText("helloWorld, nested")' , settings: { 'preact-i18n': { ...settings['preact-i18n'], scopes: ['', 'parent'] } } },
		{ code: 'withText({a: "helloWorld", b: "parent.nested"})' },
		{ code: 'withTextAlais({a: "helloWorld", b: "parent.nested"})' }
	],
	invalid: [
		{
			code: '<Text id="errorForMissingFile" />',
			settings: {
				'preact-i18n': {
					languageFiles: [
						{
							name: 'es',
							path: 'test/i18n/es.json'
						}
					]
				}
			},
			errors: [
				{
					message: "'es' language is missing",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Text id="foo" />',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Text id="helloWorld" />',
			settings: { 'preact-i18n': { ...settings['preact-i18n'], scopes: ['parent'] } },
			errors: [
				{
					message: "'helloWorld' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Dialog title="foo" />',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<MarkupText id="foo" />',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<DialogMarkup title="foo" />',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Text id="badPluralizedPluralSingular" plural={1}/>',
			errors: [
				{
					message: "[singular] pluralization keys are missing for key 'badPluralizedPluralSingular' in 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Dialog title="badPluralizedPluralSingular" count={1}/>',
			errors: [
				{
					message: "[singular] pluralization keys are missing for key 'badPluralizedPluralSingular' in 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<DialogMarkup title="badPluralizedPluralSingular" count={1}/>',
			errors: [
				{
					message: "[singular] pluralization keys are missing for key 'badPluralizedPluralSingular' in 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Text id="badPluralizedNoneOneMany" plural={1}/>',
			errors: [
				{
					message: "[none,many] pluralization keys are missing for key 'badPluralizedNoneOneMany' in 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Text id="unknownPluralization" plural={1}/>',
			errors: [
				{
					message: "unrecognized pluralization format for key 'unknownPluralization' in 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: '<Text id="badPluralizedArray" plural={1} />',
			errors: [
				{
					message: "array pluralized key 'badPluralizedArray' does not have exactly two values for [plural, singular]",
					type: 'Literal'
				}
			]
		},
		{
			code: 'withText("helloWorld,foo,bar")',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				},
				{
					message: "'bar' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: 'withText({a: "helloWorld", b: "foo"})',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				}
			]
		},
		{
			code: 'withTextAlias({a: "helloWorld", b: "foo"})',
			errors: [
				{
					message: "'foo' is missing from 'en' language",
					type: 'Literal'
				}
			]
		}
	]
});
