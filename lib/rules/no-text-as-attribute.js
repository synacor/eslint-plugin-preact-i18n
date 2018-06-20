"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const minimatch = require('minimatch');

const _require = require('../utils'),
      isDisallowedTextNode = _require.isDisallowedTextNode;

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
    const config = context.settings['preact-i18n'];

    if (config && config.ignoreFiles && minimatch(context.getFilename(), config.ignoreFiles)) {
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
        for (let i = 0; i < attributes.length; i++) {
          let attribute = attributes[i];

          if (attribute === node.name.name) {
            let text = isDisallowedTextNode({
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