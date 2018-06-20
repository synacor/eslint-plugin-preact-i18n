const RuleTester = require('eslint/lib/testers/rule-tester');
const rule = require('../../../src/rules/no-text-as-children');

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6,
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		'preact-i18n': {
			textComponentRegex: '^Text(?:Alias)?$',
			markupTextComponentRegex: '^MarkupText(?:Alias)?$',
			withTextRegex: '^withText(?:Alias)?$',
			ignoreFiles: '**/*.spec.js'
		}
	}
});

ruleTester.run('no-text-as-children', rule, {
	valid: [
		{ code: '<span><Text id="helloWorld">Fallback Text Is OK</Text></span>' },
		{ code: '<span>OK Because File is Ignored</span>', filename: 'blah/foo.spec.js' },
		{ code: '<span>{`Ignore backtick template strings`}</span>' },
		{ code: '<span><TextAlias id="helloWorld">Fallback Text Is OK in Alternate Tag</TextAlias></span>' },
		{ code: '<span><MarkupText id="helloWorld"><div><span>Fallback Text With Markup Is OK</span></div></MarkupText></span>' },
		{ code: '<span><MarkupTextAlias id="helloWorld"><div><span>Fallback Text With Markup Is OK</span></div></MarkupTextAlias></span>' },
		{ code: '<span><Text id="helloWorld"/> / <Text id="helloWorld"/></span>', options: [{
			ignoreTextRegex: '^\\s*/\\s*$' // Test allowing something like a forward slash as a text node without i18n
		}]
		}
	],
	invalid: [
		{
			code: '<span>Hello world !</span>',
			errors: [
				{
					message: "Untranslated text 'Hello world !'",
					type: 'Literal'
				}
			]
		},
		{
			code: '<span>{"Hello world !"}</span>',
			errors: [
				{
					message: "Untranslated text 'Hello world !'",
					type: 'JSXExpressionContainer'
				}
			]
		},
		{
			code: '<span><Text id="helloWorld"/> some untranslated peer text.</span>',
			errors: [
				{
					message: "Untranslated text 'some untranslated peer text.'",
					type: 'Literal'
				}
			]
		}
	]
});
