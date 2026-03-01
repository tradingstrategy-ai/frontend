<!--
Description page for YAML-configured strategies — renders short and long descriptions.
-->
<script lang="ts">
	import { Markdown } from '$lib/components';

	export let data;

	$: ({ strategy } = data);
</script>

<svelte:head>
	<title>Description | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Detailed information about {strategy.name} strategy" />
</svelte:head>

<div class="strategy-description">
	<p class="lead">{strategy.short_description}</p>

	{#if strategy.long_description}
		<Markdown content={strategy.long_description} />
	{:else}
		<p class="no-details">No additional details available.</p>
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

		.lead {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
			color: var(--c-text);
			margin-bottom: 1rem;
		}

		.no-details {
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-roman);
		}
	}
</style>
