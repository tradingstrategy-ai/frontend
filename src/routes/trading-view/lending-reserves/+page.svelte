<!--
	Render listing of all available Reserves
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import LendingReserveTable, { sortOptions } from '$lib/explorer/LendingReserveTable.svelte';
	import { Alert, HeroBanner, Section } from '$lib/components';
	import { getNumberParam, getStringParam } from '$lib/helpers/url-params.js';

	let { data } = $props();
	let { rows, totalRowCount } = $derived(data);

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
	<title>Lending Reserves</title>
	<meta name="description" content="Top decentralised lending reserves" />
</svelte:head>

<Breadcrumbs labels={{ 'lending-reserves': 'All lending reserves' }} />

<main class="reserves-index-page">
	<Section tag="header">
		<HeroBanner
			title="Lending reserves"
			subtitle="Browse lending reserves across supported chains and protocols below"
		/>
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
		<LendingReserveTable {rows} {...options} {onChange} />
	</Section>
</main>
