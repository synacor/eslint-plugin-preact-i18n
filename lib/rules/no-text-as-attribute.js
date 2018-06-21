"use strict";

var _minimatch = _interopRequireDefault(require("minimatch"));

var _utils = require("../utils");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const DEFAULT_ATTRIBUTES = ['alt', 'aria-label', 'placeholder', 'title'];
module.exports = {
  meta: {
    docs: {
      description: 'ensures that no plain text is used in attributes',
      category: 'Possible errors'
    },
    schema: [{
      type: 'object',
      properties: {
        attributes: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'string'
          },
          uniqueItems: true
        },
        ignoreTextRegex: {
          type: 'string'
        }
      },
      additionalProperties: false
    }]
  },

  create(context) {
    const _ref = context.settings['preact-i18n'] || {},
          ignoreFiles = _ref.ignoreFiles,
          _ref$textComponents = _ref.textComponents,
          textComponents = _ref$textComponents === void 0 ? _constants.DEFAULT_TEXT_COMPONENTS : _ref$textComponents,
          _ref$markupTextCompon = _ref.markupTextComponents,
          markupTextComponents = _ref$markupTextCompon === void 0 ? _constants.DEFAULT_MARKUP_TEXT_COMPONENTS : _ref$markupTextCompon;

    if (ignoreFiles && (0, _minimatch.default)(context.getFilename(), ignoreFiles)) {
      return {};
    }

    const _context$options = _slicedToArray(context.options, 1),
          _context$options$ = _context$options[0],
          options = _context$options$ === void 0 ? [] : _context$options$;

    const _options$attributes = options.attributes,
          attributes = _options$attributes === void 0 ? DEFAULT_ATTRIBUTES : _options$attributes,
          ignoreTextRegex = options.ignoreTextRegex;
    const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);
    return {
      JSXAttribute(node) {
        // Text attributes are allowed for i18n components
        let parentNode = node.parent.parent;

        if ((0, _utils.getI18NComponent)({
          node: parentNode,
          components: textComponents
        }) || (0, _utils.getI18NComponent)({
          node: parentNode,
          components: markupTextComponents
        })) {
          return;
        }

        for (let i = 0; i < attributes.length; i++) {
          let attribute = attributes[i];

          if (attribute === node.name.name) {
            let text = (0, _utils.isDisallowedTextNode)({
              node: node.value,
              parent: node,
              ignoreTextRE
            });

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