<!--
	Render listing of all available Reserves for specific chain
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import LendingReserveTable from '$lib/explorer/LendingReserveTable.svelte';
	import { Alert, HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters.js';

	export let data;
	$: ({ chain, rows, totalRowCount } = data);

	$: q = $page.url.searchParams;
	$: options = {
		page: Number(q.get('page')) || 0,
		sort: q.get('sort') || 'tvl',
		direction: q.get('direction') || 'desc'
	};

	async function handleChange({ detail }: ComponentEvents<LendingReserveTable>['change']) {
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>{chain.chain_name} Lending Reserves</title>
	<meta name="description" content="Top lending reserves on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name, lending: 'Lending reserves' }} />

<main class="reserves-index-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="{chain.chain_name} lending reserves">
			<svelte:fragment slot="subtitle">
				Browse {formatAmount(totalRowCount)} lending reserves on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			</svelte:fragment>
		</HeroBanner>
	</Section>

	{#if rows && totalRowCount && rows.length < totalRowCount}
		<Section>
			<Alert size="md" status="warning" title="Max rows exceeded">
				{rows.length} out of {totalRowCount} total lending reserves were loaded. A max of 1,000 lending reserves can be fetched
				in a single API request. This limitation can be removed by switching to server-side pagination and sorting.
			</Alert>
		</Section>
	{/if}

	<Section padding="sm">
		<LendingReserveTable hideChainIcon {rows} {...options} on:change={handleChange} />
	</Section>
</main>
