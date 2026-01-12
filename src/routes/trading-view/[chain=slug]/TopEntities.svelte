<script module lang="ts">
	export type EntityData = { error: object; rows?: [] } | { error?: undefined; rows: Record<string, any>[] };
</script>

<script lang="ts">
	import type { Component } from 'svelte';
	import type { EntityTableProps } from './TradingEntitiesTable.svelte';
	import type { Chain } from '$lib/helpers/chain';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import SummaryBox from '$lib/components/SummaryBox.svelte';

	interface Props {
		type: string;
		label?: string;
		title: string;
		chain: Chain;
		data: Promise<EntityData>;
		EntityTable: Component<EntityTableProps>;
		rightColHeader?: string;
	}

	// prettier-ignore
	let {
		type,
		label = type.replaceAll('-', ' '),
		title,
		chain,
		data,
		EntityTable,
		rightColHeader,
	}: Props = $props();

	let hasData = $state(true);

	// assign hasData inside $effect() instead of $derived() because it's async
	$effect(() => {
		data.then(({ rows, error }) => {
			hasData = !error && rows.length > 0;
			if (error) console.error(`Error loading ${label}:`, error);
		});
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
		<EntityTable loading rows={Array(5).fill({})} />
	{:then { rows, error }}
		{#if error}
			<Alert size="md" title="Error">An error occurred loading {label}. Try reloading the page.</Alert>
		{:else if hasData}
			<EntityTable {rows} />
		{:else}
			<p>No {label} available for {chain.name}</p>
		{/if}
	{/await}

	<Button slot="cta" href="/trading-view/{chain.slug}/{type}" disabled={!hasData}>
		View all {chain.name}
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
