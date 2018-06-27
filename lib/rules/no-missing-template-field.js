"use strict";

var _minimatch = _interopRequireDefault(require("minimatch"));

var _utils = require("../utils");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TEMPLATE_RE = /\{\{.*\}\}/;
module.exports = {
  meta: {
    docs: {
      description: 'ensures that translation keys that utilize template fields are passed field data',
      category: 'Possible errors'
    },
    schema: [{
      additionalProperties: false
    }]
  },

  create(context) {
    const config = context.settings['preact-i18n'] || {};
    const ignoreFiles = config.ignoreFiles,
          scopes = config.scopes,
          _config$textComponent = config.textComponents,
          textComponents = _config$textComponent === void 0 ? _constants.DEFAULT_TEXT_COMPONENTS : _config$textComponent,
          _config$markupTextCom = config.markupTextComponents,
          markupTextComponents = _config$markupTextCom === void 0 ? _constants.DEFAULT_MARKUP_TEXT_COMPONENTS : _config$markupTextCom;
    if (ignoreFiles && (0, _minimatch.default)(context.getFilename(), ignoreFiles)) return {};
    return {
      JSXElement(node) {
        // Get the key value and pluralNode (optional) from the attributes of the JSX element
        let _getI18nAttributeNode = (0, _utils.getI18nAttributeNodes)({
          node,
          textComponents,
          markupTextComponents
        }),
            idNode = _getI18nAttributeNode.idNode,
            pluralNode = _getI18nAttributeNode.pluralNode,
            fieldsNode = _getI18nAttributeNode.fieldsNode;

        if (!idNode) {
          return;
        }

        let key = idNode.value;
        (0, _utils.getLangConfig)(config).forEach(({
          translation
        }) => {
          if (!translation) {
            return;
          }

          const isPluralized = !!pluralNode;
          let values = (0, _utils.get)(translation, key, scopes);

          if (isPluralized) {
            Array.isArray(values) || (values = Object.values(values));
          } else {
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