# eslint-plugin-preact-i18n

This is an [eslint](http://eslint.org/) plugin for applications using the [preact-i18n](https://github.com/synacor/preact-i18n) library.

## Installation

``` shell
npm i -D eslint-plugin-preact-i18n
```

## Rules

* **[preact-i18n/no-missing-template-field](docs/rules/no-missing-template-field.md)**: Errors if `fields` attribute is not provided to `<Text/>` or `<MarkupText/>` component when the value of the key contains template fields in their values.  Also shows an error when `fields` is supplied but unneeded by the localized string.
* **[preact-i18n/no-text-as-children](docs/rules/no-text-as-children.md)**: Verify that you have no text node children in your preact code.
* **[preact-i18n/no-text-as-attribute](docs/rules/no-text-as-attribute.md)**: Verify that you have no text in some attributes in your react components. List of attributes provided in the config.
* **[preact-i18n/no-unknown-key](docs/rules/no-unknown-key.md)**: Verify that all translation keys you use are present in your defined translation files. 
 
## Config

You have to add the following lines in your `.eslintrc` file to configure this plugin:

```js
  // Declare the plugin
  "plugins": [
    "preact-i18n"
  ],
  // The plugin needs jsx feature to be enabled to work
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  // Settings of your translation
  "settings": {
    "preact-i18n": {
			// required location and friendly name (used in error messages) for each language file
			// to be checked in no-unkown-key and no-missing-template-field rules
      "languageFiles": [
        {
          "name": "en",
          "path": "i18n/en.json"
        }
			],
			
			// optional time-to-live of the translations file caching (defaults to 500ms)
			"translationsCacheTTL": 300
			
      // optional if you want to ignore specific files for all rules via blob matcher
			"ignoreFiles": "**/*.spec.js",

			// optional to allow other names for the preact-i18n Text component.  Defaults to only allowing Text
			// This example allows Text or TextAlias
			"textComponentRegex": "^Text(?:Alias)?$",

			// optional to allow other names for the preact-i18n MarkupText component.  Defaults to only allowing MarkupText
			// This example allows MarkupText or MarkupTextAlias
			"markupTextComponentRegex": "^MarkupText(?:Alias)?$",

			// optional to allow other names for the preact-i18n withText function/decorator.  Defaults to only allowing withText
			// This example allows withText or withTextAlias
			"withTextRegex": "^withText(?:Alias)?$"
      
    }
	},
	// Specify rules severity and rule-specific configurations
  "rules": {
		"preact-i18n/no-missing-template-field": "error",
		"preact-i18n/no-text-as-attribute": "error",
		"preact-i18n/no-text-as-children": "error",
    "preact-i18n/no-unknown-key": "error"
  }
```
