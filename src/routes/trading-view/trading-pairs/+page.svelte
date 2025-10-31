<!--
	Render listing of all available Pairs
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairTable from '$lib/explorer/PairTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	let { data } = $props();
	let { pairs, options } = $derived(data);

	let loading = $state(false);

	const onChange: ComponentProps<typeof PairTable>['onChange'] = async (params, scrollToTop) => {
		loading = true;
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		loading = false;
		scrollToTop();
	};
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
		<PairTable {...pairs} {...options} {loading} {onChange} />
	</Section>
</main>
