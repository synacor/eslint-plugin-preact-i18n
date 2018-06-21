import { DEFAULT_MARKUP_TEXT_COMPONENTS } from '../../../src/constants';
import { getLangConfig, has, get, isDisallowedTextNode, getI18nAttributeNodes } from '../../../src/utils';
import fs from 'fs';
import assert from 'assert';
import sinon from 'sinon';

describe('utils', () => {

	describe('isDisallowedTextNode', () => {
		it('should return undefined for nodes that are not string literals or JSXExpressions with string literal values', () => {
			assert.equal(isDisallowedTextNode({ node: { type: 'FunctionExpression' } }), undefined);
		});

		it('should return trimmed value for Literal values', () => {
			assert.equal(isDisallowedTextNode({ node: { type: 'Literal', value: '  some stuff \n\r  ' } }), 'some stuff');
		});

		it('should return trimmed value for Literal JSXExpressionContainer values', () => {
			assert.equal(isDisallowedTextNode({ node: { type: 'JSXExpressionContainer', value: 'bad', expression: { type: 'Literal', value: '  some stuff \n\r  ' } } }), 'some stuff');
		});

		it('should return undefined for strings matching the ignoreTextRE regex', () => {
			assert.equal(isDisallowedTextNode({
				node: { type: 'Literal', value: '  some stuff \n\r  ' },
				ignoreTextRE: /^some stuff$/
			}), undefined);
		});

		it('should return undefined for strings that are descendants of allowed markup nodes', () => {
			assert.equal(isDisallowedTextNode({
				node: {
					type: 'Literal',
					value: '  some stuff \n\r  '
				},
				parent: {
					type: 'JSXElement',
					openingElement: {
						name: {
							name: 'MarkupText'
						}
					}
				},
				markupTextComponents: DEFAULT_MARKUP_TEXT_COMPONENTS
			}), undefined);
		});

	});

	describe('getI18nAttributeNodes', () => {

		const textComponents = [
			{ nameRegex: '^Text$' } ,
			{ nameRegex: '^Dialog$', id: 'title', plural: 'count', fields: 'data' }
		];
		const markupTextComponents = [
			{ nameRegex: '^MarkupText$' } ,
			{ nameRegex: '^DialogMarkup$', id: 'title', plural: 'count', fields: 'data' }
		];

		const createLiteralAttribute = (name) => ({
			name: { name },
			value: {
				type: 'Literal',
				value: 'foo'
			}
		});

		it('should return empty object if node is not an i18n node we are checking', () => {
			let idAttribute = createLiteralAttribute('id');
			let node = {
				openingElement: {
					name: {
						name: 'NonI18NNode'
					},
					attributes: [
						idAttribute
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { });
		});

		it('should return idNode if value of id attribute is Literal string', () => {
			let idAttribute = createLiteralAttribute('id');
			let node = {
				openingElement: {
					name: {
						name: 'Text'
					},
					attributes: [
						idAttribute
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { idNode: idAttribute.value, pluralNode: undefined, fieldsNode: undefined });
		});

		it('should return JSXExpressionContainer expression for idNode if value of id attribute is JSXExpressionContainer with Literal value', () => {
			let idAttribute = {
				name: { name: 'id' },
				value: {
					type: 'JSXExpressionContainer',
					expression: {
						type: 'Literal',
						value: 'foo'
					}
				}
			};
			let node = {
				openingElement: {
					name: {
						name: 'Text'
					},
					attributes: [
						idAttribute
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { idNode: idAttribute.value.expression, pluralNode: undefined, fieldsNode: undefined });
		});

		it('should return false for idNode if value of id attribute is not Literal value or JSXExpressionContainer with Literal value', () => {
			let idAttribute = {
				name: { name: 'id' },
				value: {
					type: 'Something else',
					expression: {
						type: 'Literal',
						value: 'foo'
					}
				}
			};
			let node = {
				openingElement: {
					name: {
						name: 'Text'
					},
					attributes: [
						idAttribute
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { idNode: false, pluralNode: undefined, fieldsNode: undefined });
		});

		it('should return fields and plural nodes if they are present', () => {
			let pluralNode = {
				name: { name: 'plural' },
				value: 'pluralNodeValue'
			};
			let fieldsNode = {
				name: { name: 'fields' },
				value: 'fieldsNodeValue'
			};
			let node = {
				openingElement: {
					name: {
						name: 'Text'
					},
					attributes: [
						fieldsNode,
						pluralNode
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { idNode: undefined, pluralNode: 'pluralNodeValue', fieldsNode: 'fieldsNodeValue' });
		});

		it('should allow for different component names and aliases for id, plural, and fields for Text components', () => {
			let idAttribute = createLiteralAttribute('title');
			let pluralAttribute = createLiteralAttribute('count');
			let fieldsAttribute = createLiteralAttribute('data');
			let node = {
				openingElement: {
					name: {
						name: 'Dialog'
					},
					attributes: [
						idAttribute,
						pluralAttribute,
						fieldsAttribute
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { idNode: idAttribute.value, pluralNode: pluralAttribute.value, fieldsNode: fieldsAttribute.value });
		});

		it('should allow for different component names and aliases for id, plural, and fields for MarkupText components', () => {
			let idAttribute = createLiteralAttribute('title');
			let pluralAttribute = createLiteralAttribute('count');
			let fieldsAttribute = createLiteralAttribute('data');
			let node = {
				openingElement: {
					name: {
						name: 'DialogMarkup'
					},
					attributes: [
						idAttribute,
						pluralAttribute,
						fieldsAttribute
					]
				}
			};
			let result = getI18nAttributeNodes({ node, textComponents, markupTextComponents });
			assert.deepEqual(result, { idNode: idAttribute.value, pluralNode: pluralAttribute.value, fieldsNode: fieldsAttribute.value });
		});

	});

	describe('get', () => {
		it('should get a deep key when it exists by dot notation', () => {
			const object = {
				foo: {
					bar: 'foobar'
				}
			};

			assert.equal(get(object, 'foo.bar'), 'foobar');
		});

		it('should return undefined if the key does not exist at the path', () => {
			assert.equal(get({}, 'foo.bar'), undefined);
		});

	});

	describe('has', () => {
		it('should return true if a key exists at the dot notated location', () => {
			const object = {
				foo: {
					'bar-baz': 'foobar'
				}
			};

			assert(has(object, 'foo.bar-baz'));
		});

		it('should return false if a key does not exist at the dot notated location', () => {
			const object = {
				foo: {
					'bar-baz': 'foobar'
				}
			};

			assert.equal(has(object, 'foo.buzz'), false);
		});

		it('should return true if key exists but has empty string', () => {
			const object = {
				foo: {
					bar: ''
				}
			};

			assert(has(object, 'foo.bar'));
		});

	});


	describe('getLangConfig', () => {

		let clock;

		afterEach(() => {
			fs.readFileSync.restore && fs.readFileSync.restore();
			clock && clock.restore();
		});

		it('should parse json for all provided languages if they exist', () => {
			let langConfig = getLangConfig({
				languageFiles: [
					{ name: 'en', path: 'test/i18n/en.json' },
					{ name: 'fr', path: 'test/i18n/fr.json' }
				],
				disableCache: true
			});
			assert.equal(langConfig.length, 2, 'langConfig should have 2 values');
			assert.equal('en', langConfig[0].name);
			assert.equal('fr', langConfig[1].name);
			assert.equal('No Things', langConfig[0].translation.pluralizedAndtemplated.none);
			assert.equal('Pas de choses', langConfig[1].translation.pluralizedAndtemplated.none);
		});

		it('should return null for translation if the file can\'t be loaded', () => {
			let langConfig = getLangConfig({
				languageFiles: [
					{ name: 'en', path: 'test/i18n/en.json' },
					{ name: 'bad', path: 'test/i18n/bad.json' }
				],
				disableCache: true
			});
			assert.equal(langConfig.length, 2, 'langConfig should have 2 values');
			assert.equal('en', langConfig[0].name);
			assert.equal('bad', langConfig[1].name);
			assert.equal('No Things', langConfig[0].translation.pluralizedAndtemplated.none);
			assert.equal(null, langConfig[1].translation);
		});

		it('should use the cached language file for subsequent calls when caching is enabled', () => {
			let readSpy = sinon.spy(fs, 'readFileSync');
			getLangConfig({
				languageFiles: [
					{ name: 'en-test1-1', path: 'test/i18n/en.json' }
				]
			});
			assert.equal(1, readSpy.callCount);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test1-1', path: 'test/i18n/en.json' }
				]
			});
			assert.equal(1, readSpy.callCount);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test1-2', path: 'test/i18n/en.json' }
				]
			});
			assert.equal(2, readSpy.callCount);
		});

		it('should not store cached value if disableCache flag is set', () => {
			let readSpy = sinon.spy(fs, 'readFileSync');
			getLangConfig({
				languageFiles: [
					{ name: 'en-test4', path: 'test/i18n/en.json' }
				],
				disableCache: true
			});
			assert.equal(1, readSpy.callCount);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test4', path: 'test/i18n/en.json' }
				]
			});

			assert.equal(2, readSpy.callCount);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test4', path: 'test/i18n/en.json' }
				]
			});

			assert.equal(2, readSpy.callCount);
		});

		it('should refresh the cache after the default 500ms timer expires', () => {
			let readSpy = sinon.spy(fs, 'readFileSync');
			clock = sinon.useFakeTimers();
			getLangConfig({
				languageFiles: [
					{ name: 'en-test2', path: 'test/i18n/en.json' }
				]
			});
			assert.equal(1, readSpy.callCount);

			clock.tick(499);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test2', path: 'test/i18n/en.json' }
				]
			});
			assert.equal(1, readSpy.callCount);

			clock.tick(1);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test2', path: 'test/i18n/en.json' }
				]
			});
			assert.equal(2, readSpy.callCount);

		});

		it('should refresh the cache after the customized 300ms timer expires', () => {
			let readSpy = sinon.spy(fs, 'readFileSync');
			clock = sinon.useFakeTimers();
			getLangConfig({
				languageFiles: [
					{ name: 'en-test3', path: 'test/i18n/en.json' }
				],
				translationsCacheTTL: 300
			});
			assert.equal(1, readSpy.callCount);

			clock.tick(299);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test3', path: 'test/i18n/en.json' }
				],
				translationsCacheTTL: 300
			});
			assert.equal(1, readSpy.callCount);

			clock.tick(1);

			getLangConfig({
				languageFiles: [
					{ name: 'en-test3', path: 'test/i18n/en.json' }
				],
				translationsCacheTTL: 300
			});
			assert.equal(2, readSpy.callCount);

		});

	});
});
