<!--
	Render listing of all available Pairs for specific chain
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairTable from '$lib/explorer/PairTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters.js';

	export let data;
	$: ({ chain, pairs, options } = data);

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<PairTable>['change']) {
		loading = true;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		loading = false;
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>{chain.chain_name} Trading Pairs | Trading Strategy</title>
	<meta name="description" content="Top trading pairs on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name, 'trading-pairs': 'Trading pairs' }} />

<main class="pair-index-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="{chain.chain_name} trading pairs">
			<svelte:fragment slot="subtitle">
				Browse {formatAmount(pairs.totalRowCount)} trading pairs on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<PairTable
			{...pairs}
			{...options}
			{loading}
			hideChainIcon
			hiddenColumns={['liquidity', 'liquidity_change_24h']}
			on:change={handleChange}
		/>
	</Section>
</main>
