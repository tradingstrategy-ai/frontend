<!--
	Daily winners page
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
	const pairs = momentumData && momentumData.top_up_24h_min_liq_1m;
</script>

<svelte:head>
	<title>DEX tokens with the highest daily profit</title>
	<meta name="description" content="Trading pairs with most profit for the last 24h" />
</svelte:head>

<main>
	<header class="ds-container">
		<Breadcrumbs labels={{ 'top-list': 'Top lists', 'daily-up': 'Daily gainers' }} />

		<h1>Trading pairs with the most profit for the last 24h</h1>

		<p class="lead">
			<a class="body-link" href="/trading-view/trading-pairs">Trading pairs</a> with the highest profit on
			<a class="body-link" href="/trading-view/exchanges">decentralised exchanges</a> today. Showing only the pairs with
			minimum $1M liquidity. All trading pairs are benchmarked against the US Dollar.
		</p>
	</header>

	<section class="ds-container">
		<StaleDataWarning allChains={true} />

		{#if pairs}
			<MomentumTable {pairs} kind="price" />
		{:else}
			<div class="alert alert-danger">Daily volatility data is not available at the moment.</div>
		{/if}
	</section>
</main>

<style>
	.ds-container {
		grid-template-columns: auto;
		gap: 0rem;
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	.lead {
		margin: 2rem 0;
	}
</style>
