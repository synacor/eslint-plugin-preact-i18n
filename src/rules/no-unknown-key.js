import minimatch from 'minimatch';
import { get, has, getI18nAttributeNodes, getLangConfig } from '../utils';
import { DEFAULT_TEXT_COMPONENTS, DEFAULT_MARKUP_TEXT_COMPONENTS, DEFAULT_WITH_TEXT_RE } from '../constants';

const PLURAL_KEY_FORMS = [
	['singular', 'plural'],
	['none', 'one', 'many'],
	['zero', 'one', 'other']
];

function checkForMissingKey({ context, node, config, key, pluralNode, ignorePluralFormat }) {
	getLangConfig(config).forEach(({ name, translation }) => {
		if (!translation) {
			return context.report({
				node,
				severity: 2,
				message: `'${name}' language is missing`
			});

		}

		if (typeof pluralNode === 'undefined' && !has(translation, key, config.scopes)) {
			return context.report({
				node,
				severity: 2,
				message: `'${key}' is missing from '${name}' language`
			});
		}

		let tranlationValue = get(translation, key, config.scopes);

		if (typeof pluralNode === 'undefined' && typeof tranlationValue !== 'string') {
			return context.report({
				node,
				severity: 2,
				message: `'${key}' is not a string in '${name}' language.  Possibly missing plural attribute for pluralizable field.`
			});

		}

		if (pluralNode) {

			if (typeof tranlationValue === 'string') {
				return context.report({
					node,
					severity: 2,
					message: `plural attribute supplied for unpluralized key '${key}'.  Either pluralize key or remove plural attribute.`
				});
			}

			//Don't check any of the plural key formats if the flag is set
			if (ignorePluralFormat ) return;

			if (Array.isArray(tranlationValue)) {
				return tranlationValue.length !== 2 && context.report({
					node,
					severity: 2,
					message: `array pluralized key '${key}' does not have exactly two values for [plural, singular]`
				});
			}

			const matchingKeyForms = PLURAL_KEY_FORMS.filter(keyForms => {
				const matchingKeys = keyForms.filter(plural => has(translation, `${key}.${plural}`));
				return (matchingKeys.length === keyForms.length);
			});

			const incompleteKeyForms = PLURAL_KEY_FORMS.filter(keyForms => {
				let matchingKeys = keyForms.filter(plural => has(translation, `${key}.${plural}`));
				if (matchingKeys.length === keyForms.length) return false;
				let missingKeys = keyForms.filter(plural => !has(translation, `${key}.${plural}`));
				return (missingKeys.length && missingKeys.length !== keyForms.length);
			});
			if (matchingKeyForms.length > 0) {
				return;
			}
			else if (incompleteKeyForms.length > 0) {
				// sort incomplete key forms such that the one with the least missing
				const missingKeys = incompleteKeyForms.reduce((prevMissingKeys, keyForms) => {
					const altMissingKeys = keyForms.filter(plural => !has(translation, `${key}.${plural}`));
					if (!prevMissingKeys || altMissingKeys.length < prevMissingKeys.length) {
						return altMissingKeys;
					}
					return prevMissingKeys;
				}, null);
				
				return context.report({
					node,
					message: `[${missingKeys}] pluralization keys are missing for key '${key}' in '${name}' language`
				});
			}
			
			context.report({
				node,
				message: `unrecognized pluralization format for key '${key}' in '${name}' language`
			});

		}
	});
}

module.exports = {
	meta: {
		docs: {
			description: 'ensures that used translate key is in translation file',
			category: 'Possible errors'
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignorePluralFormat: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		]
	},
	create(context) {
		const config = context.settings['preact-i18n'] || {};
		const {
			ignoreFiles,
			textComponents=DEFAULT_TEXT_COMPONENTS,
			markupTextComponents=DEFAULT_MARKUP_TEXT_COMPONENTS,
			withTextRegex=DEFAULT_WITH_TEXT_RE
		} = config;

		if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) return {};

		const withTextRE = new RegExp(withTextRegex);

		const [options={}] = context.options;
		const { ignorePluralFormat } = options;

		return {
			CallExpression(node) {
				if (withTextRE.test(node.callee.name)) {
					let arg = node.arguments && node.arguments[0];
					if (arg.type === 'Literal') {
						arg.value.split(',').forEach(key => checkForMissingKey({ context, node: arg, config, ignorePluralFormat, key: key.trim() }));
					}

					if (arg.type === 'ObjectExpression') {
						arg.properties.forEach(prop => {
							if (prop.value.type === 'Literal') {
								checkForMissingKey({ context, node: prop.value, config, ignorePluralFormat, key: prop.value.value.trim() });
							}
						});
					}

				}
			},
			JSXElement(node) {

				// Get the key value and pluralNode (optional) from the attributes of the JSX element
				let { idNode, pluralNode, key } = getI18nAttributeNodes({ context, node, textComponents, markupTextComponents });

				if (!idNode) {
					return;
				}

				checkForMissingKey({ context, node: idNode, config, ignorePluralFormat, key, pluralNode });
			}
		};
	}
};
