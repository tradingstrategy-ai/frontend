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
	import type { Language } from 'svelte-highlight';
	import Highlight from 'svelte-highlight';
	import 'svelte-highlight/styles/github-dark.css';

	export let language: Language;
	export let code: string;
</script>

<div class="source-code">
	<Highlight {language} {code} />
</div>

<style lang="postcss">
	.source-code {
		display: grid;
		padding: var(--space-xxs);
		border-radius: var(--radius-md);
		background-color: var(--c-ink);

		& :global(.hljs) {
			background-color: transparent;
		}
	}
</style>
