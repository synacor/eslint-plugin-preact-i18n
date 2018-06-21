import minimatch from 'minimatch';
import { get, getI18nAttributeNodes, getLangConfig } from '../utils';
import { DEFAULT_TEXT_COMPONENTS, DEFAULT_MARKUP_TEXT_COMPONENTS } from '../constants';

const TEMPLATE_RE = /\{\{.*\}\}/;

module.exports = {
	meta: {
		docs: {
			description: 'ensures that translation keys that utilize template fields are passed field data',
			category: 'Possible errors'
		},
		schema: [
			{
				additionalProperties: false
			}
		]
	},
	create(context) {
		const config = context.settings['preact-i18n'] || {};
		const {
			ignoreFiles,
			textComponents=DEFAULT_TEXT_COMPONENTS,
			markupTextComponents=DEFAULT_MARKUP_TEXT_COMPONENTS
		} = config;
		if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) return {};


		return {
			JSXElement(node) {
				// Get the key value and pluralNode (optional) from the attributes of the JSX element
				let { idNode, pluralNode, fieldsNode } = getI18nAttributeNodes({ node, textComponents, markupTextComponents });

				if (!idNode) {
					return;
				}
				let key = idNode.value;

				getLangConfig(config).forEach(({ translation }) => {
					if (!translation) {
						return;
					}

					const isPluralized = !!pluralNode;
					let values = get(translation, key);


					if (isPluralized) {
						Array.isArray(values) || (values = Object.values(values));
					}
					else {
						values = [values];
					}

					if ((!fieldsNode || fieldsNode.name === 'undefined') && values.some(value => TEMPLATE_RE.test(value))) {
						context.report({
							node,
							severity: 2,
							message: `'${key}' has template fields but no fields attribute.`
						});

						return;
					}

					if (fieldsNode && !values.some(value => TEMPLATE_RE.test(value))) {
						context.report({
							node,
							severity: 2,
							message: `'${key}' doesn't require any template field data.`
						});
					}
				});
			}
		};
	}
};
