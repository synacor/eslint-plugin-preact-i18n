import minimatch from 'minimatch';
import { getI18NComponent, isDisallowedTextNode } from '../utils';
import { DEFAULT_TEXT_COMPONENTS, DEFAULT_MARKUP_TEXT_COMPONENTS } from '../constants';

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
			textComponents=DEFAULT_TEXT_COMPONENTS,
			markupTextComponents=DEFAULT_MARKUP_TEXT_COMPONENTS
		} = context.settings['preact-i18n'] || {};

		if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) return {};

		const [options={}] = context.options;
		const { ignoreTextRegex } = options;
		const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);

		return {
			JSXElement(node) {
				// Text children are allowed for our i18n components for their fallback text
				if ( getI18NComponent({ node, components: textComponents }) || getI18NComponent({ node, components: markupTextComponents })) {
					return;
				}

				node.children.forEach(child => {
					let text = isDisallowedTextNode({ node: child, parent: node, ignoreTextRE, markupTextComponents } );

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
