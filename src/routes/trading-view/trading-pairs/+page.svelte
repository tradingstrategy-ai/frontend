<!--
	Render listing of all available Pairs
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairTable from '$lib/explorer/PairTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data;
	$: ({ pairs, options } = data);

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<PairTable>['change']) {
		loading = true;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		loading = false;
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>Trading Pairs</title>
	<meta name="description" content="Top decentralised Pairs" />
</svelte:head>

<Breadcrumbs labels={{ 'trading-pairs': 'All trading pairs' }} />

<main class="pair-index-page">
	<Section tag="header">
		<HeroBanner title="Trading pairs" subtitle="Browse trading pairs across all decentralised exchanges below" />
	</Section>

	<Section padding="sm">
		<PairTable
			{...pairs}
			{...options}
			{loading}
			hiddenColumns={['liquidity', 'liquidity_change_24h']}
			on:change={handleChange}
		/>
	</Section>
</main>
