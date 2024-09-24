<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { ApiChain } from '$lib/helpers/chain';
	import { Alert, Button, SummaryBox } from '$lib/components';

	type EntityData = { error: object; rows?: [] } | { error?: undefined; rows: Record<string, any>[] };

	export let type: string;
	export let label = type.replaceAll('-', ' ');
	export let title: string;
	export let chain: ApiChain;
	export let data: Promise<EntityData>;
	export let tableComponent: ComponentType;
	export let rightColHeader = '';

	let hasData = true;

	$: data.then(({ rows, error }) => {
		hasData = !error && rows.length > 0;
		if (error) {
			console.error(`Error loading ${label}:`, error);
		}
	});
</script>

<SummaryBox {title} ctaPosition="bottom">
	<header slot="header">
		<h3>{title}</h3>
		{#if hasData}
			<h4>{rightColHeader}</h4>
		{/if}
	</header>

	{#await data}
		<svelte:component this={tableComponent} loading rows={Array(5).fill({})} />
	{:then { rows, error }}
		{#if error}
			<Alert size="md" title="Error">An error occurred loading {label}. Try reloading the page.</Alert>
		{:else if hasData}
			<svelte:component this={tableComponent} {rows} />
		{:else}
			<p>No {label} available for {chain.chain_name}</p>
		{/if}
	{/await}

	<Button slot="cta" href="/trading-view/{chain.chain_slug}/{type}" disabled={!hasData}>
		View all {chain.chain_name}
		{label}
	</Button>
</SummaryBox>

<style>
	header[slot='header'] {
		gap: var(--space-md);
		align-items: flex-end;

		h4 {
			padding: 0 var(--space-md) var(--space-xxs) 0;
			font: var(--f-ui-md-bold);
			letter-spacing: var(--f-ui-md-spacing);
			color: var(--c-text-extra-light);

			@media (--viewport-md-down) {
				font: var(--f-ui-sm-bold);
				letter-spacing: var(--f-ui-sm-spacing);
			}
		}
	}
</style>
