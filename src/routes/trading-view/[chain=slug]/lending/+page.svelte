<!--
	Render listing of all available Reserves for specific chain
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import LendingReserveTable, { sortOptions } from '$lib/explorer/LendingReserveTable.svelte';
	import { Alert, HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters';
	import { getNumberParam, getStringParam } from '$lib/helpers/url-params.js';

	let { data } = $props();
	let { chain, rows, totalRowCount } = $derived(data);

	let { searchParams } = $derived(page.url);

	let options = $derived({
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	});

	const onChange: ComponentProps<typeof LendingReserveTable>['onChange'] = async (params, scrollToTop) => {
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};
</script>

<svelte:head>
	<title>{chain.chain_name} Lending Reserves</title>
	<meta name="description" content="Top lending reserves on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name, lending: 'Lending reserves' }} />

<main class="reserves-index-page">
	<Section tag="header">
		<HeroBanner title="{chain.chain_name} lending reserves">
			{#snippet subtitle()}
				Browse {formatAmount(totalRowCount)} lending reserves on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			{/snippet}
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
		<LendingReserveTable hideChainIcon {rows} {...options} {onChange} />
	</Section>
</main>
