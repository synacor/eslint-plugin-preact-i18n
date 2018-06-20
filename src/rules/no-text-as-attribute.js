const minimatch = require('minimatch');
const { isDisallowedTextNode } = require('../utils');

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
		const config = context.settings['preact-i18n'];

		if (config && config.ignoreFiles && minimatch(context.getFilename(), config.ignoreFiles)) {
			return {};
		}

		const [options=[]] = context.options;
		const { attributes=DEFAULT_ATTRIBUTES, ignoreTextRegex } = options;
		const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);

		return {
			JSXAttribute(node) {
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
