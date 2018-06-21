import RuleTester from 'eslint/lib/testers/rule-tester';
import rule from '../../../src/rules/no-text-as-attribute';

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6,
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		'preact-i18n': {
			ignoreFiles: '**/*.spec.js',
			textComponents: [
				{ nameRegex: '^Text$' },
				{ nameRegex: '^Dialog$', id: 'title', plural: 'count', fields: 'data' }
			],
			markupTextComponents: [
				{ nameRegex: '^MarkupText$' },
				{ nameRegex: '^DialogMarkup$', id: 'title', plural: 'count', fields: 'data' }
			]
		}
	}
});

ruleTester.run('no-text-as-attribute', rule, {
	valid: [
		{ code: '<img/>' },
		{ code: '<img alt={<span>no-text-as-children rule would fail this</span>} />' },
		{ code: '<img alt={`Ignore backtick template strings`} />' },
		{ code: '<img nonCheckedAttribute="foo bar" />' },
		{ code: '<img {...props} />' },
		{ code: '<img placeholder={props.foo} />' },
		{ code: '<img alt="OK Because File is Ignored" />', filename: 'blah/foo.spec.js' },
		{ code: '<img alt=" / " />', options: [{
			ignoreTextRegex: '^\\s*/\\s*$' // Test allowing something like a forward slash as a text node without i18n
		}]
		},
		{ code: '<img alt="alt is not in overriden attributes list" />', options: [{ attributes: ['placeholder'] }] },
		{ code: '<Text id="i18n ids are ignored" />' },
		{ code: '<Dialog title="i18n ids are ignored" />' },
		{ code: '<MarkupText id="i18n ids are ignored" />' },
		{ code: '<DialogMarkup title="i18n ids are ignored" />' }
	],
	invalid: [
		{
			code: '<img alt={"foo"} />',
			errors: [
				{
					message: 'Untranslated JSX attribute alt with "foo"',
					type: 'JSXAttribute'
				}
			]
		},
		{
			code: '<img alt="foo" aria-label="buzz" placeholder="bar" title="baz" />',
			errors: [
				{
					message: 'Untranslated JSX attribute alt with "foo"',
					type: 'JSXAttribute'
				},
				{
					message: 'Untranslated JSX attribute aria-label with "buzz"',
					type: 'JSXAttribute'
				},
				{
					message: 'Untranslated JSX attribute placeholder with "bar"',
					type: 'JSXAttribute'
				},
				{
					message: 'Untranslated JSX attribute title with "baz"',
					type: 'JSXAttribute'
				}
			]
		},
		{
			code: '<img alt={props.foo} placeholder="bar" />',
			errors: [
				{
					message: 'Untranslated JSX attribute placeholder with "bar"',
					type: 'JSXAttribute'
				}
			]
		}
	]
});
