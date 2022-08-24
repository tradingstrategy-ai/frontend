<!--
	Render list of all trading pairs
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
</script>

<svelte:head>
	<title>Trading pairs on decentralised exchanges</title>
	<meta name="description" content="Top trading pairs and tokens" />
</svelte:head>

<Breadcrumbs labels={{ 'trading-pairs': 'All trading pairs' }} />

<main>
	<header class="ds-container">
		<h1>Trading pairs</h1>
		<p>
			Browse trading pairs across all <a href="/trading-view/exchanges">decentralised exchanges</a> below.
		</p>
	</header>

	<section class="ds-container">
		<StaleDataWarning allChains={true} />

		<PairExplorer
			enabledColumns={[
				'pair_name',
				'exchange_name',
				'usd_price_latest',
				'price_change_24h',
				'usd_volume_30d',
				'usd_liquidity_latest',
				'liquidity_change_24h'
			]}
			orderColumnIndex={4}
			pageLength={50}
		/>
	</section>
</main>

<style>
	.ds-container {
		grid-template-columns: auto;
		gap: 0;
	}

	header h1 {
		font: var(--f-h2-medium);
		margin-bottom: 0.5rem;
	}

	section {
		margin-top: 1rem;
	}

	section :global(.col-exchange) {
		white-space: nowrap;
	}
</style>
