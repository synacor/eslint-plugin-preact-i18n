const minimatch = require('minimatch');
const { isDisallowedTextNode } = require('../utils');
const { DEFAULT_TEXT_COMPONENT_RE, DEFAULT_MARKUP_TEXT_COMPONENT_RE } = require('../constants');

module.exports = {
	meta: {
		docs: {
			description: 'ensures that no plain text is used in JSX components',
			category: 'Possible errors'
		},
		schema: [
			{
				type: 'object',
				properties: {
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
			textComponentRegex=DEFAULT_TEXT_COMPONENT_RE,
			markupTextComponentRegex=DEFAULT_MARKUP_TEXT_COMPONENT_RE
		} = context.settings['preact-i18n'] || {};

		if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) return {};

		const [options={}] = context.options;
		const { ignoreTextRegex } = options;
		const nodeNameRE = new RegExp(textComponentRegex);
		const markupNodeNameRE = new RegExp(markupTextComponentRegex);
		const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);

		return {
			JSXElement(node) {
				if (nodeNameRE.test(node.openingElement.name.name)) return;

				node.children.forEach(child => {
					let text = isDisallowedTextNode({ node: child, parent: node, ignoreTextRE, markupNodeNameRE } );

					if (text) {
						context.report({
							node: child,
							message: `Untranslated text '${text}'`
						});
					}

				});
			}
		};
	}
};
