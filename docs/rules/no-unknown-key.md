# Verify that referenced translation keys are present in your defined translation files (preact-i18n/no-unknown-key)

When your components use [preact-i18n] elements that lookup localized strings by `id`, and you have access to the localization file(s) from the component source code location, this rule helps enforce that all referenced `id`s exist in the localization file, taking pluralization into account.

## Rule Details

This rule enforces that string ids used in the [preact-i18n] functions and components like `<Text/>`, `<MarkupText/>` and `withText()` resolve to valid keys in the localization files supplied in the `languageFiles` setting for the plugin.  If no `languageFiles` are specified in settings, this rule does nothing.

Example localization file
```json
{
  "helloWorld": "Hello world !",
  "pluralizedArray": ["Many Things", "One Thing"],
  "pluralizedNoneOneMany": {
    "none": "No Things",
    "one": "One Thing",
    "many": "Many Things"
  },
  "pluralizedPluralSingular": {
    "singular": "One Thing",
    "plural": "Many Things"
  },
  "badPluralizedArray": ["Many Things"],
  "badPluralizedPluralSingular": {
    "plural": "Many Things"
  },
  "badPluralizedNoneOneMany": {
    "one": "One Thing"
  },
  "unknownPluralization": {
    "bar": "One Thing"
  },
  "templated": "Hello {{foo}}",
  "pluralizedAndtemplated": {
    "none": "No Things",
    "one": "One Thing",
    "many": "Many {{foo}}"
  },
  "parent": {
    "nested": "A Nested Key"
  }
}
```

Examples of **incorrect** code for this rule

```jsx
// Missing key for Text Component
<Text id="missingKey" />

// Missing key for MarkupText Component
<MarkupText id="missingKey" />

// plural is passed and pluralization key exists for plural/singular form, but is missing the singular key
<Text id="badPluralizedPluralSingular" plural={1}/>

// plural is passed and pluralization key exists for none/one/many form, but is missing the none and many keys
<Text id="badPluralizedNoneOneMany" plural={1}/>

// plural is passed but pluralization form cannot be determined
<Text id="unknownPluralization" plural={1}/>

// plural is passed and pluralization key exists for array form, does not have exactly two keys
<Text id="badPluralizedArray" plural={1} />

// withText with string argument form is missing foo and bar keys
withText("helloWorld,foo,bar")

// withText with object argument form is missing foo key
withText({a: "helloWorld", b: "foo"})
```


Examples of **correct** code for this rule
```jsx
//key exists for Text component
<Text id="helloWorld"/>

//key exists for MarkupText component
<MarkupText id="helloWorld"/>

//missing key, but Non preact-i18n component
<ShouldNotFlagForMissingKey id="foo"/>

// pluralized key exists when plural is passed, and two elements exist in array
<Text id="pluralizedArray" plural={0} />

// pluralized key exists when plural is passed and none, one, many keys are present
<Text id="pluralizedNoneOneMany" plural="0" />

// pluralized key exists when plural is passed and plural and singular keys are present
<Text id="pluralizedPluralSingular" plural="0" />

// withText has present keys for comma delimmited string argument form
withText("helloWorld,parent.nested")

// withText has present keys for object argument form
withText({a: "helloWorld", b: "parent.nested"})

/* eslint preact-i18n/no-unknown-key: ["error", { ignorePluralFormat: true }] */
<Text id="badPluralizedArray" plural={1} />
```

## Options

### `ignorePluralFormat` [optional]
Boolean, defaults to `false`.  If set to `true`, and a component utilizes the `plural` attribute, the rule validates that the key referenced is not a `string` and thus could be an appropriate pluralization value, but it does not validate the pluralization keys.  This is useful if you have other logic that ensures that some of the pluralization types in a given format would never be hit.

**Ignore globally**
```js
{
	"ignorePluralFormat": true
}
```

**Ignore in a given file**

```js
/* eslint preact-i18n/no-unknown-key: ["error", { ignorePluralFormat: true }] */
```


[preact-i18n]: https://www.npmjs.com/package/preact-i18n
