# Verify that translation keys that utilize template fields are passed field data (preact-i18n/no-missing-template-field)

## Rule Details

[preact-i18n] allows for localization strings that contain template data, e.g.

```json
{
	"deletedItems": "You deleted {{num}} items",
}
```

Fields are passed to template strings using the `fields` attribute.  This rule enforces that localization strings that have template fields are passed a `fields` attribute, but it does not validate that the `fields` value contains the exact keys that are necessary (possible future enhancement).  The rule also enforces that a `fields` attribute is not passed when the localization string is not templated.

Example localization file
```json
{
  "helloWorld": "Hello world !",
  "pluralizedPluralSingular": {
    "singular": "One Thing",
    "plural": "Many Things"
  },
  "templated": "Hello {{foo}}",
  "pluralizedAndtemplated": {
    "none": "No Things",
    "one": "One Thing",
    "many": "Many {{foo}}"
  }
}
```

Examples of **incorrect** code for this rule

```jsx
// fields attribute is present on non-templated localization string
<Text id="helloWorld" fields={{foo: "bar"}} />

// templated localization string without fields attribute
<MarkupText id="templated" />

// fields attribute is present on pluralized key without any templated localization strings
<Text id="pluralizedPluralSingular" fields={{foo: "bar"}} plural={3} />

// pluralized key with a templated localization string and no fields attribute
<MarkupText id="pluralizedAndtemplated" plural={3} />
```


Examples of **correct** code for this rule
```jsx
// No fields attribute on a non-templated localiation string
<Text id="helloWorld" />

// Fields attribute present on templated localization string
<MarkupText id="templated" fields={{foo: "bar"}} />

// Fields attribute present on pluralized key with at least one templated localization string
<Text id="pluralizedAndtemplated" fields={{foo: "bar"}} plural={3}/>
```

## Options

This rule has no additional options


[preact-i18n]: https://www.npmjs.com/package/preact-i18n
