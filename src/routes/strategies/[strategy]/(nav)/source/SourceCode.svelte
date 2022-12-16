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
	.source {
		border-radius: var(--border-radius-md);
		padding: 1.75rem 0.75rem;
	}

	pre {
		display: grid;
		padding: 5px;
		background: var(--cm-light, var(--c-parchment-dark)) var(--cm-dark, var(--c-ink));
		color: var(--cm-light, var(--c-text-1-v1)) var(--cm-dark, var(--c-text-1-v1));
		counter-reset: line;
	}

	code {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 1rem;
		font-weight: 600 !important;
		counter-increment: line;
		padding-left: 1rem;
	}

	code:before {
		display: inline-block;
		content: counter(line);
		margin-right: 1rem;
		opacity: 0.5;
		user-select: none;
		text-align: right;
	}
</style>
