"use strict";

const minimatch = require('minimatch');

const _require = require('../utils'),
      get = _require.get,
      getI18nAttributeNodes = _require.getI18nAttributeNodes,
      getLangConfig = _require.getLangConfig;

const _require2 = require('../constants'),
      DEFAULT_TEXT_COMPONENT_RE = _require2.DEFAULT_TEXT_COMPONENT_RE,
      DEFAULT_MARKUP_TEXT_COMPONENT_RE = _require2.DEFAULT_MARKUP_TEXT_COMPONENT_RE;

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
          _config$textComponent = config.textComponentRegex,
          textComponentRegex = _config$textComponent === void 0 ? DEFAULT_TEXT_COMPONENT_RE : _config$textComponent,
          _config$markupTextCom = config.markupTextComponentRegex,
          markupTextComponentRegex = _config$markupTextCom === void 0 ? DEFAULT_MARKUP_TEXT_COMPONENT_RE : _config$markupTextCom;
    if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) return {};
    const nodeNameRE = new RegExp(textComponentRegex);
    const markupNodeNameRE = new RegExp(markupTextComponentRegex);
    return {
      JSXElement(node) {
        let nodeName = node.openingElement.name.name; // If it is not a preact-i18n component, ignore it

        if (!nodeNameRE.test(nodeName) && !markupNodeNameRE.test(nodeName)) return;

        let _getI18nAttributeNode = getI18nAttributeNodes(node),
            idNode = _getI18nAttributeNode.idNode,
            pluralNode = _getI18nAttributeNode.pluralNode,
            fieldsNode = _getI18nAttributeNode.fieldsNode;

        if (!idNode) {
          return;
        }

        let key = idNode.value;
        getLangConfig(config).forEach(({
          translation
        }) => {
          if (!translation) {
            return;
          }

          const isPluralized = !!pluralNode;
          let values = get(translation, key);

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