<script context="module" lang='ts'>
	/**
	 * Daily losers page
	 */
	import { buildBreadcrumbs } from '$lib/breadcrumb/builder';
	import { backendUrl } from '$lib/config';
	import type { Json } from '$lib/types';

	/**
	 * Helper used to render daily up and daily down pages.
	 *
	 * If server cannot give us data, return `null`.
	 */
	export async function loadTopData(fetch: Function): Promise<Json> {
		const momentumResp = await fetch(`${backendUrl}/tokens`);

		console.log(momentumResp);

		let topMomentum;

		if (momentumResp.ok) {
			topMomentum = await momentumResp.json();
		} else {
			// Try render the frontpage even if the backend is down
			topMomentum = null;
		}

		return topMomentum;
	}

	export async function load({ url, params, fetch }) {
		const breadcrumbs = {
			'trading-view': 'Trading data',
			'top-list': 'Top lists',
			'top': 'Top lists',
			'token': 'Token',
			'daily-up': 'Liquidity'
		};
		const topKind = params.token;
		return {
			props: {
				topData: await loadTopData(fetch),
				breadcrumbs: buildBreadcrumbs(url.pathname, breadcrumbs),
				topKind
			}
		};
	}
</script>

<script>
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
	import TokenTopTable from '$lib/content/TokenTopTable.svelte';
	import PairExplorer from "$lib/explorer/PairExplorer.svelte";

	export let topData;
	export let breadcrumbs;
	export let topKind;

  console.log(topData);

	export let tokens = topData && topData.top_up_24h_min_liq_1m;
</script>

<svelte:head>
	<title>DEX tokens with the highest liquidity</title>
	<meta name="description" content="Trading pairs with most profit for the last 24h" />
</svelte:head>

<div class="container">
	<Breadcrumb {breadcrumbs} />

	<h1>Trading pairs with the most liquidity for the last 24h</h1>

	<p class="lead">
		<a class="body-link" href="/trading-view/trading-pairs">Top Trading pairs</a> with the highest
		{topKind} on <a class="body-link" href="/trading-view/exchanges">decentralised exchanges</a> today.
		Showing only the pairs with minimum $1M liquidity. All trading pairs are benchmarked against the
		US Dollar.
	</p>

	<div class="trading-pairs">
		<StaleDataWarning allChains={true} />

		<PairExplorer
			enabledColumns={["pair_name", "exchange_name", "usd_price_latest", "price_change_24h", "usd_volume_30d", "usd_liquidity_latest", "liquidity_change_24h",]}
			orderColumnIndex={4}
			pageLength={50}
			paging={0}
		/>
	</div>
</div>

<style>
	.lead {
		margin: 2rem 0;
	}
</style>
