<script context="module" lang="typescript">
	/**
	 * Render list of all trading pairs
	 */

	import { buildBreadcrumbs } from '$lib/breadcrumb/builder';

	export async function load({ url }) {
		const pathTranslations = {
			'trading-view': 'Trading data',
			'trading-pairs': 'All trading pairs'
		};

		const crumbs = buildBreadcrumbs(url.pathname, pathTranslations);

		return {
			props: {
				breadcrumbs: crumbs
			}
		};
	}
</script>

<script lang="typescript">
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';

	export let breadcrumbs;
</script>

<svelte:head>
	<title>Trading pairs on decentralised exchanges</title>
	<meta name="description" content="Top trading pairs and tokens" />
</svelte:head>

<div class="container container-main exchanges">
	<Breadcrumb {breadcrumbs} />
	<div class="row">
		<div class="col-md-12">
			<div class="trading-pairs">
				<h1>Trading pairs</h1>

				<p>
					Browse trading pairs across all <a href="/trading-view/exchanges">decentralised exchanges</a> below.
				</p>

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
			</div>
		</div>
	</div>
</div>

<style>
	.trading-pairs :global(.col-exchange) {
		white-space: nowrap;
	}
</style>
