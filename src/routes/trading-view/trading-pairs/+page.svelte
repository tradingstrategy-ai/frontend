<!--
	Render listing of all available Pairs
-->
<script lang="ts">
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
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

<MetaTags
	titleParts={['Trading pairs', 'DEX market data']}
	description="Top decentralised exchange trading pairs ranked by volume and liquidity, with price charts and historical OHLCV data."
/>

<Breadcrumbs labels={{ 'trading-pairs': 'All trading pairs' }} />

<main class="pair-index-page">
	<Section tag="header">
		<HeroBanner title="Trading pairs" subtitle="Browse trading pairs across all decentralised exchanges below" />
	</Section>

	<Section padding="sm">
		<PairTable {...pairs} {...options} {loading} {onChange} />
	</Section>
</main>
