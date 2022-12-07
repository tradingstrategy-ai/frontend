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
	export let source: string;

	// Currently loaded source code
	$: sourceLines = source.split('\n');
</script>

<pre class="source">
	{#each sourceLines as line}
		<code>{line}</code>
	{/each}
</pre>

<style lang="postcss">
	pre {
		background: var(--cm-light, var(--c-parchment-dark)) var(--cm-dark, var(--c-ink));
		color: var(--cm-light, var(--c-text-1-v1)) var(--cm-dark, var(--c-text-1-v1));
		font-weight: bold;
		padding: 5px;
		counter-reset: line;
		width: 100%;
		height: calc(100vh - 16rem);
		display: grid;
		overflow-x: scroll;
		overscroll-behavior: none;
	}

	code {
		counter-increment: line;
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 1rem;
	}

	code:before {
		display: inline-block;
		content: counter(line);
		user-select: none;
		text-align: right;
		opacity: 0.5;
	}
</style>
