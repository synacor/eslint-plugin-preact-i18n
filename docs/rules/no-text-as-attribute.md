# Verify that JSX nodes do not contain non-i18n'd text as specified attribute values (preact-i18n/no-text-as-attributes)

## Rule Details

Examples of **incorrect** code for this rule

```jsx
// string for a checked attribute
<img alt="foo" />

// JSX expression that evaluates to a string for a checked attribute
<input placeholder={"foo"} />
```


Examples of **correct** code for this rule 

```jsx
// no attributes to check
<img/>

// alt attribute is using i18n mechanism
<img alt={<Text id="helloWorld"/>} />

// baz is not in list of checked attributes
<img baz="foo bar" />

// placholder cannot verify if props.foo is a string or an i18n mechanism, so no error is thrown
<input type="text" placeholder={props.foo} />

// Ignore smiling faces
/*eslint preact-i18n/no-text-as-attribute: ["error", { "ignoreTextRegex": "^:\\)$"]*/
<img alt={:)} >
```

## Options

### `attributes` [optional]
An array of strings of attributes that should be checked that overrides the default.  Default is:
```js
{
	"attributes": ["alt", "aria-label", "placeholder", "title"]
}
```

### `ignoreTextRegex` [optional]
A regular expression that, if supplied, ignores the content of text matching the regex.  Useful if you want to ignore things like `/` in a text attribute.  For example, to ignore any slash or colon surrounded by whitespace you would provide:
```js
{
	"ignoreTextRegex": "^\\s*[/:]\\s*$"
}
```

[preact-i18n]: https://www.npmjs.com/package/preact-i18n
