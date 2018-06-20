"use strict";

module.exports = {
  rules: {
    'no-unknown-key': require('./rules/no-unknown-key'),
    'no-text-as-attribute': require('./rules/no-text-as-attribute'),
    'no-text-as-children': require('./rules/no-text-as-children'),
    'no-missing-template-field': require('./rules/no-missing-template-field')
  }
};