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

<div class="source terminal-viewport">
	<svelte:component this={highlightComponent} code={source} />
</div>

<style>
	.source {
		min-height: calc(100vh - 18rem);
	}

	.source :global(pre code.hljs) {
		padding: 0 !important;
	}
</style>
