<!--
	Daily losers page
-->
<script context="module">
	import { loadMomentumData } from '$lib/content/momentum';

	export async function load({ url, fetch, session }) {
		const { backendUrl } = session.config;

		const momentumData = await loadMomentumData(backendUrl, fetch);
		return { props: { momentumData } };
	}
</script>

<script>
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import MomentumTable from '$lib/content/MomentumTable.svelte';

	export let momentumData;
	const pairs = momentumData && momentumData.top_down_24h_min_liq_1m;
</script>

<svelte:head>
	<title>DEX tokens with the highest daily losses</title>
	<meta name="description" content="Trading pairs with most volatile losses for the last 24h" />
</svelte:head>

<div class="container">
	<Breadcrumbs labels={{ 'top-list': 'Top lists', 'daily-down': 'Daily losers' }} />

	<h1>Trading pairs with the most loss for the last 24h</h1>

	<p class="lead">
		<a class="body-link" href="/trading-view/trading-pairs">Trading pairs</a> with the highest drawdown on
		<a class="body-link" href="/trading-view/exchanges">decentralised exchanges</a> today. Showing only the pairs with minimum
		$1M liquidity. All trading pairs are benchmarked against the US Dollar.
	</p>

	<div class="trading-pairs">
		<StaleDataWarning allChains={true} />

		{#if pairs}
			<MomentumTable {pairs} kind="price" />
		{:else}
			<div class="alert alert-danger">Daily volatility data is not available at the moment.</div>
		{/if}
	</div>
</div>

<style>
	.lead {
		margin: 2rem 0;
	}
</style>
