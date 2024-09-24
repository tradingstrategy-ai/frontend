<script lang="ts">
	import { Markdown } from '$lib/components';

	export let data;
	const { strategy } = data;

	const content = strategy.long_description;
</script>

<svelte:head>
	<title>Description | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Detailed information about {strategy.name} strategy" />
</svelte:head>

<div class="strategy-description">
	{#if content}
		<Markdown {content} />
	{:else}
		No details available.
	{/if}
</div>

<style>
	.strategy-description {
		overflow-x: auto;
		background: var(--c-box-1);
		border-radius: var(--radius-md);
		padding: 1.5rem;

		@media (--viewport-sm-down) {
			padding: 1rem;
		}
	}
</style>
