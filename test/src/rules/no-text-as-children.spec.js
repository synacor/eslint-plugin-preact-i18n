import RuleTester from 'eslint/lib/testers/rule-tester';
import rule from '../../../src/rules/no-text-as-children';

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6,
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		'preact-i18n': {
			textComponents: [
				{ nameRegex: '^Text$' },
				{ nameRegex: '^Dialog$', id: 'title', plural: 'count', fields: 'data' }
			],
			markupTextComponents: [
				{ nameRegex: '^MarkupText$' },
				{ nameRegex: '^DialogMarkup$', id: 'title', plural: 'count', fields: 'data' }
			],
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
		{ code: '<span><Dialog title="helloWorld">Fallback Text Is OK in Alternate Tag</Dialog></span>' },
		{ code: '<span><MarkupText id="helloWorld"><div><span>Fallback Text With Markup Is OK</span></div></MarkupText></span>' },
		{ code: '<span><DialogMarkup title="helloWorld"><div><span>Fallback Text With Markup in alternate name Is OK</span></div></DialogMarkup></span>' },
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
