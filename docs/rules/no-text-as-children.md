# Verify that JSX nodes do not contain non-i18n'd text as child nodes (preact-i18n/no-text-as-children)

## Rule Details

Examples of **incorrect** code for this rule

```jsx
// Non-i18n node with text child
<span>Hello world !</span>

// Non-i18n node with expression that evaluates to text child
<span>{"Hello world !"}</span>

// Non-i18n with i18n node and text node peer
<span><Text id="helloWorld"/> some untranslated peer text.</span>

```


Examples of **correct** code for this rule 

```jsx
// Text is allowed to have fallback text
<span><Text id="helloWorld">Fallback Text Is OK</Text></span>

// normal nodes can have text if they are in the fallback section of MarkupText
<span>
	<MarkupText id="helloWorld">
		<div>
			<span>Fallback Text With Markup Is OK</span>
		</div>
	</MarkupText>
</span>

// Ignore / and : as surrounded by space as text nodes
/*eslint preact-i18n/no-text-as-children: ["error", {"ignoreTextRegex": "^\\s*[/:]\\s*$"}]*/
<span><Text id="foo"/> / <Text id="bar"/>  :  <Text id="buz"/>
```

## Options

### `ignoreTextRegex` [optional]
A regular expression that, if supplied, ignores the content of text nodes matching the regex.  Useful if you want to ignore things like `/` as a text node.  For example, to ignore any slash or colon surrounded by whitespace you would provide:
```js
{
	"ignoreTextRegex": "^\\s*[/:]\\s*$"
}
```

[preact-i18n]: https://www.npmjs.com/package/preact-i18n
