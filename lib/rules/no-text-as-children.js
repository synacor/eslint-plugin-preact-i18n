"use strict";

var _minimatch = _interopRequireDefault(require("minimatch"));

var _utils = require("../utils");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = {
  meta: {
    docs: {
      description: 'ensures that no plain text is used in JSX components',
      category: 'Possible errors'
    },
    schema: [{
      type: 'object',
      properties: {
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

    if (ignoreFiles && (0, _minimatch.default)(context.getFilename(), ignoreFiles)) return {};

    const _context$options = _slicedToArray(context.options, 1),
          _context$options$ = _context$options[0],
          options = _context$options$ === void 0 ? {} : _context$options$;

    const ignoreTextRegex = options.ignoreTextRegex;
    const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);
    return {
      JSXElement(node) {
        // Text children are allowed for our i18n components for their fallback text
        if ((0, _utils.getI18NComponent)({
          node,
          components: textComponents
        }) || (0, _utils.getI18NComponent)({
          node,
          components: markupTextComponents
        })) {
          return;
        }

        node.children.forEach(child => {
          let text = (0, _utils.isDisallowedTextNode)({
            node: child,
            parent: node,
            ignoreTextRE,
            markupTextComponents
          });

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