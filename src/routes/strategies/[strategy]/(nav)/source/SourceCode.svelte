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
	import { onMount } from 'svelte';
	let highlightComponent: any;
	let highlightStyles: any;

	export let source: string;

	onMount(async () => {
		highlightComponent = (await import('svelte-highlight')).HighlightAuto;
		highlightStyles = (await import('svelte-highlight/src/styles/github-dark')).default;
	});
</script>

<svelte:head>
	{#if highlightStyles}
		{@html highlightStyles}
	{/if}
</svelte:head>

<div class="source">
	<svelte:component this={highlightComponent} code={source} />
</div>

<style lang="postcss">
	.source {
		border-radius: var(--border-radius-md);
		padding: 1.75rem 0.75rem;
	}

	.source :global(.hljs) {
		background-color: transparent;
	}

	.source {
		background-color: var(--c-ink) !important;
		display: grid;
		padding: 5px;
		background: #1e1e1e;
		color: var(--cm-light, var(--c-text-1-v1)) var(--cm-dark, var(--c-text-1-v1));
		counter-reset: line;
	}
</style>
