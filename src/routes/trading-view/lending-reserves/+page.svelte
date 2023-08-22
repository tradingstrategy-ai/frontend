<!--
	Render listing of all available Reserves
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import LendingReserveTable from '$lib/explorer/LendingReserveTable.svelte';
	import { Alert, HeroBanner, Section } from '$lib/components';

	export let data;
	$: ({ rows, totalRowCount } = data);

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
		<LendingReserveTable {rows} {...options} on:change={handleChange} />
	</Section>
</main>
