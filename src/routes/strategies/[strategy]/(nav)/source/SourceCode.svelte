<!--
@component
Display the source code of the strategy.
TODO: Add nice source code formatting widget

#### Usage:
```tsx
	<SourceCode source={code} />
```
-->
<script lang="ts">
	import { HighlightSvelte } from 'svelte-highlight';
	import github from 'svelte-highlight/src/styles/github-dark';

	// $: code = `<button on:click={() => { console.log(0); }}>Increment {count}</button>`;
	export let source: string;

	// Currently loaded source code
	$: sourceLines = source.split('\n').join();
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/svelte-highlight/styles/github.css" />
	{@html github}
</svelte:head>

<pre class="source">
	<HighlightSvelte code={source} />
</pre>

<style lang="postcss">
	.source {
		border-radius: var(--border-radius-md);
		padding: 1.75rem 0.75rem;
	}

	pre {
		display: grid;
		padding: 5px;
		background: #1e1e1e;
		color: var(--cm-light, var(--c-text-1-v1)) var(--cm-dark, var(--c-text-1-v1));
		counter-reset: line;
	}
</style>
