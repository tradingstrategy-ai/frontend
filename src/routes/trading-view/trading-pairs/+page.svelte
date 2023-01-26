<!--
	Render list of all trading pairs
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
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
		<p>Browse trading pairs across all decentralised exchanges below.</p>
	</header>

	<section class="ds-container">
		<PairExplorer
			enabledColumns={[
				'pair_name',
				'exchange_name',
				'pair_swap_fee',
				'usd_price_latest',
				'price_change_24h',
				'usd_volume_30d',
				'usd_liquidity_latest',
				'liquidity_change_24h'
			]}
			orderColumnIndex={5}
			pageLength={10}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
	}

	header {
		gap: var(--space-sl);

		& p {
			font: var(--f-h3-roman);

			@media (--viewport-md-down) {
				font: var(--f-h4-roman);
			}
		}
	}
</style>
