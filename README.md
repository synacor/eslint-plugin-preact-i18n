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

			// optional Provide list of preact-i18n scopes (i.e. namespace prefixes to dot-notated keys) that should be checked when trying to find keys.  Default is no additional scopes
			"scopes": ['', 'foo-component'],

      // optional time-to-live of the translations file caching (defaults to 500ms)
      "translationsCacheTTL": 300

      // optional if you want to ignore specific files for all rules via blob matcher
      "ignoreFiles": "**/*.spec.js",

      // optional to allow other names of components for the Text component, with other attribute
      // names for the id, plural, and fields values.  If not supplied, only Text component will be checked
      // with its default attribute names.
      //
      // This is useful if you have components that take in i18n keys in their props and turn around and render
      // Text components as their children.
      //
      // Below is an example where components with the names <Text/> or <AltText /> will be checked, assuming the normal id, plural, and fields attributes names
      // and <Dialog /> components will be checked  where the "title" attribute contains the i18n key, the "count" attribute contains
      // the plural value, and the "data" attribute contains the fields value that gets passed to Text eventually
      //
      // Only nameRegex is required for each entry.  id, plural, and fields will default to their respective names
      "textComponents": [
        { "nameRegex": '^(?:Alt)?Text$' },
        { "nameRegex": '^Dialog$', "id": 'title', "plural": 'count', "fields": 'data' }
      ],

      // optional, equivalent to the textComponents setting, but for the MarkupText component.
      "markupTextComponents": [
        { "nameRegex": "^MarkupText$" },
        { "nameRegex": "^DialogMarkup$", "id": "title", "plural": "count", "fields": "data" }
      ],

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
