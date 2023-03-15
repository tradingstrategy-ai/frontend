<!--
	Render listing of all available Pairs
-->
<script lang="ts">
	import type { PageData } from './$types';
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairsTable from '$lib/explorer/PairsTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data: PageData;

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<PairsTable>['change']) {
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
		<PairsTable {...data} {loading} on:change={handleChange} />
	</Section>
</main>
