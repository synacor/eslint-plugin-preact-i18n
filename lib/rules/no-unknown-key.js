"use strict";

var _minimatch = _interopRequireDefault(require("minimatch"));

var _utils = require("../utils");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const PLURAL_KEY_FORMS = [['singular', 'plural'], ['none', 'one', 'many']];

function checkForMissingKey({
  context,
  node,
  config,
  key,
  pluralNode,
  ignorePluralFormat
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
      } //Don't check any of the plural key formats if the flag is set


      if (ignorePluralFormat) return;

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
      type: 'object',
      properties: {
        ignorePluralFormat: {
          type: 'boolean'
        }
      },
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

    const _context$options = _slicedToArray(context.options, 1),
          _context$options$ = _context$options[0],
          options = _context$options$ === void 0 ? {} : _context$options$;

    const ignorePluralFormat = options.ignorePluralFormat;
    return {
      CallExpression(node) {
        if (withTextRE.test(node.callee.name)) {
          let arg = node.arguments && node.arguments[0];

          if (arg.type === 'Literal') {
            arg.value.split(',').forEach(key => checkForMissingKey({
              context,
              node: arg,
              config,
              ignorePluralFormat,
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
                  ignorePluralFormat,
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
          ignorePluralFormat,
          key: idNode.value,
          pluralNode
        });
      }

    };
  }

};