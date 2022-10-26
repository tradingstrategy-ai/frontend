<script lang="ts">
	import type { PageData } from './$types';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>
		{data.symbol} on {data.chain_name}
	</title>
	<meta
		name="description"
		content={`${data.name} (${data.symbol} ${getTokenStandardName(data.chain_slug)} on ${data.chain_name}`}
	/>
</svelte:head>

<Breadcrumbs labels={{ [data.address]: data.name }} />

<main>
	<PageHeader title={data.name} subtitle="token trading as {data.symbol} on {data.chain_name}" />

	<section class="ds-container ds-2-col info" data-testid="token-info">
		<InfoTable {data} />
		<InfoSummary {data} />
	</section>

	<section class="ds-container trading-pairs" data-testid="trading-pairs">
		<h2>Trading pairs</h2>

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
			pageLength={10}
			tokenSymbol={data.symbol}
			tokenAddress={data.address}
		/>
	</section>

	<aside class="ds-container">
		<p>
			Trading pairs with complications (such as low liquidity) may not be displayed.
			<a rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				>Read the rules for tracked trading pairs.</a
			>
		</p>
	</aside>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 2.5rem;

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	.info {
		align-items: start;
	}

	.trading-pairs {
		gap: 1.5rem;
	}

	aside {
		& p {
			margin-top: 0rem;
			font: var(--f-ui-large-roman);
		}

		& a {
			font-weight: 700;
			text-decoration: underline;
		}
	}
</style>
