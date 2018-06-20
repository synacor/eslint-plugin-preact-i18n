"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const minimatch = require('minimatch');

const _require = require('../utils'),
      isDisallowedTextNode = _require.isDisallowedTextNode;

const _require2 = require('../constants'),
      DEFAULT_TEXT_COMPONENT_RE = _require2.DEFAULT_TEXT_COMPONENT_RE,
      DEFAULT_MARKUP_TEXT_COMPONENT_RE = _require2.DEFAULT_MARKUP_TEXT_COMPONENT_RE;

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
          _ref$textComponentReg = _ref.textComponentRegex,
          textComponentRegex = _ref$textComponentReg === void 0 ? DEFAULT_TEXT_COMPONENT_RE : _ref$textComponentReg,
          _ref$markupTextCompon = _ref.markupTextComponentRegex,
          markupTextComponentRegex = _ref$markupTextCompon === void 0 ? DEFAULT_MARKUP_TEXT_COMPONENT_RE : _ref$markupTextCompon;

    if (ignoreFiles && minimatch(context.getFilename(), ignoreFiles)) return {};

    const _context$options = _slicedToArray(context.options, 1),
          _context$options$ = _context$options[0],
          options = _context$options$ === void 0 ? {} : _context$options$;

    const ignoreTextRegex = options.ignoreTextRegex;
    const nodeNameRE = new RegExp(textComponentRegex);
    const markupNodeNameRE = new RegExp(markupTextComponentRegex);
    const ignoreTextRE = ignoreTextRegex && new RegExp(ignoreTextRegex);
    return {
      JSXElement(node) {
        if (nodeNameRE.test(node.openingElement.name.name)) return;
        node.children.forEach(child => {
          let text = isDisallowedTextNode({
            node: child,
            parent: node,
            ignoreTextRE,
            markupNodeNameRE
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