"use strict";

var _minimatch = _interopRequireDefault(require("minimatch"));

var _utils = require("../utils");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PLURAL_KEY_FORMS = [['singular', 'plural'], ['none', 'one', 'many']];

function checkForMissingKey({
  context,
  node,
  config,
  key,
  pluralNode
}) {
  (0, _utils.getLangConfig)(config).forEach(({
    name,
    translation
  }) => {
    if (!translation) {
      return context.report({
        node,
        severity: 2,
        message: `'${name}' language is missing`
      });
    }

    if (typeof pluralNode === 'undefined' && !(0, _utils.has)(translation, key)) {
      return context.report({
        node,
        severity: 2,
        message: `'${key}' is missing from '${name}' language`
      });
    }

    let tranlationValue = (0, _utils.get)(translation, key);

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

      if (Array.isArray(tranlationValue)) {
        return tranlationValue.length !== 2 && context.report({
          node,
          severity: 2,
          message: `array pluralized key '${key}' does not have exactly two values for [plural, singular]`
        });
      }

      for (let i = 0; i < PLURAL_KEY_FORMS.length; i++) {
        let matchingKeys = PLURAL_KEY_FORMS[i].filter(plural => (0, _utils.has)(translation, `${key}.${plural}`));
        if (matchingKeys.length === PLURAL_KEY_FORMS[i].length) return;
        let missingKeys = PLURAL_KEY_FORMS[i].filter(plural => !(0, _utils.has)(translation, `${key}.${plural}`));

        if (missingKeys.length && missingKeys.length !== PLURAL_KEY_FORMS[i].length) {
          return context.report({
            node,
            message: `[${missingKeys}] pluralization keys are missing for key '${key}' in '${name}' language`
          });
        }
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
    schema: [{
      additionalProperties: false
    }]
  },

  create(context) {
    const config = context.settings['preact-i18n'] || {};
    const ignoreFiles = config.ignoreFiles,
          _config$textComponent = config.textComponents,
          textComponents = _config$textComponent === void 0 ? _constants.DEFAULT_TEXT_COMPONENTS : _config$textComponent,
          _config$markupTextCom = config.markupTextComponents,
          markupTextComponents = _config$markupTextCom === void 0 ? _constants.DEFAULT_MARKUP_TEXT_COMPONENTS : _config$markupTextCom,
          _config$withTextRegex = config.withTextRegex,
          withTextRegex = _config$withTextRegex === void 0 ? _constants.DEFAULT_WITH_TEXT_RE : _config$withTextRegex;
    if (ignoreFiles && (0, _minimatch.default)(context.getFilename(), ignoreFiles)) return {};
    const withTextRE = new RegExp(withTextRegex);
    return {
      CallExpression(node) {
        if (withTextRE.test(node.callee.name)) {
          let arg = node.arguments && node.arguments[0];

          if (arg.type === 'Literal') {
            arg.value.split(',').forEach(key => checkForMissingKey({
              context,
              node: arg,
              config,
              key: key.trim()
            }));
          }

          if (arg.type === 'ObjectExpression') {
            arg.properties.forEach(prop => {
              if (prop.value.type === 'Literal') {
                checkForMissingKey({
                  context,
                  node: prop.value,
                  config,
                  key: prop.value.value.trim()
                });
              }
            });
          }
        }
      },

      JSXElement(node) {
        // Get the key value and pluralNode (optional) from the attributes of the JSX element
        let _getI18nAttributeNode = (0, _utils.getI18nAttributeNodes)({
          node,
          textComponents,
          markupTextComponents
        }),
            idNode = _getI18nAttributeNode.idNode,
            pluralNode = _getI18nAttributeNode.pluralNode;

        if (!idNode) {
          return;
        }

        checkForMissingKey({
          context,
          node: idNode,
          config,
          key: idNode.value,
          pluralNode
        });
      }

    };
  }

};