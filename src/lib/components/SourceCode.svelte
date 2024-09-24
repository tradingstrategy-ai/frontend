<!--
@component
Display source code with syntax highlighting using Highlight.js.
See: https://github.com/metonym/svelte-highlight

#### Usage:
```tsx
	import javascript from "svelte-highlight/languages/javascript";
	<SourceCode language={javascript} code="console.log('Hello, world!');" />
```
-->
<script lang="ts">
	import type { LanguageType } from 'svelte-highlight/languages';
	import Highlight from 'svelte-highlight';
	import 'svelte-highlight/styles/github-dark.css';

	export let language: LanguageType<string>;
	export let code: string;
</script>

<div class="source-code">
	<Highlight {language} {code} />
</div>

<style>
	.source-code {
		display: grid;
		padding: var(--space-xxs);
		border-radius: var(--radius-md);
		background: var(--c-terminal-bg);

		:global(.hljs) {
			background-color: transparent;
		}
	}
</style>
