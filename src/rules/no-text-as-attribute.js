import minimatch from 'minimatch';
import { getI18NComponent, isDisallowedTextNode } from '../utils';
import { DEFAULT_TEXT_COMPONENTS, DEFAULT_MARKUP_TEXT_COMPONENTS } from '../constants';

const DEFAULT_ATTRIBUTES = ['alt', 'aria-label', 'placeholder', 'title'];

module.exports = {
	meta: {
		docs: {
			description: 'ensures that no plain text is used in attributes',
			category: 'Possible errors'
		},
		schema: [
			{
				type: 'object',
				properties: {
					attributes: {
						type: 'array',
						minItems: 1,
						items: { type: 'string' },
						uniqueItems: true
					},
					ignoreTextRegex: {
						type: 'string'
					}
				},
				additionalProperties: false
			}
		]
	},
	create(context) {
		const {
			ignoreFiles,
			textComponents=DEFAULT_TEXT_COMPONENTS,
			markupTextComponents=DEFAULT_MARKUP_TEXT_COMPONENTS
		} = context.settings['preact-i18n'] || {};

		if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) {
			return {};
		}

		const [options=[]] = context.options;
		const { attributes=DEFAULT_ATTRIBUTES, ignoreTextRegex } = options;
		const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);

		return {
			JSXAttribute(node) {
				// Text attributes are allowed for i18n components
				let parentNode = node.parent.parent;
				if ( getI18NComponent({ node: parentNode, components: textComponents }) || getI18NComponent({ node: parentNode, components: markupTextComponents })) {
					return;
				}

				for (let i=0; i<attributes.length; i++) {
					let attribute = attributes[i];
					if (attribute === node.name.name ) {
						let text = isDisallowedTextNode({ node: node.value, parent: node, ignoreTextRE } );

						if (text) {
							context.report({
								node,
								message: `Untranslated JSX attribute ${attribute} with "${text}"`
							});
						}

						return;
					}
				}
			}
		};
	}
};
