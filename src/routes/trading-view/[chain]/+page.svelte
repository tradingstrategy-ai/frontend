<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import ExchangeExplorer from '$lib/explorer/ExchangeExplorer.svelte';
	import Header from './Header.svelte';
	import SummaryDataTile from './SummaryDataTile.svelte';
	import BlockInfoTile from './BlockInfoTile.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.chain_name} decentralised exchanges and trading pairs</title>
	<meta name="description" content={`Top ${data.chain_name} tokens and prices`} />
</svelte:head>

<Breadcrumbs labels={{ [data.chain_slug]: data.chain_name }} />

<main>
	<Header name={data.chain_name} logoUrl={data.chain_logo} homepage={data.homepage} />

	<section class="ds-container summary-data">
		<div class="block-info">
			<BlockInfoTile title="Last indexed block" count={data.end_block} timestamp={data.last_swap_at} />
			<BlockInfoTile title="First indexed block" count={data.start_block} timestamp={data.first_swap_at} />
		</div>

		<SummaryDataTile
			count={data.exchanges}
			title="Exchanges"
			description="Decentralised exchanges with market data available on Trading Strategy"
			buttonLabel="See exchanges"
			href="#exchanges"
		/>

		<SummaryDataTile
			count={data.pairs}
			title="Tracked trading pairs"
			description="Total trading pairs on Trading Strategy for this blockchain."
			buttonLabel="See trading pairs"
			href="#trading-pairs"
		/>

		<SummaryDataTile
			count={data.tracked_pairs}
			title="Active trading pairs"
			description="Trading pairs with market data feeds. Active trading pairs have enough trading activity to have data feeds generated for them."
			buttonLabel="See inclusion criteria"
			href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
		/>
	</section>

	<section id="exchanges" class="ds-container explorer-wrapper">
		<header>
			<h2>Exchanges on {data.chain_name}</h2>
			<StaleDataWarning chainSlugs={[data.chain_slug]} />
			<p>Showing exchanges with trading activity in last 30 days.</p>
		</header>

		<ExchangeExplorer
			chainSlug={data.chain_slug}
			enabledColumns={['human_readable_name', 'pair_count', 'usd_volume_30d']}
			orderColumnIndex={2}
		/>
	</section>

	<section id="trading-pairs" class="ds-container explorer-wrapper">
		<header>
			<h2>Trading pairs on {data.chain_name}</h2>
			<StaleDataWarning chainSlugs={[data.chain_slug]} />
		</header>
		<PairExplorer
			chainSlug={data.chain_slug}
			enabledColumns={['pair_name', 'exchange_name', 'usd_price_latest', 'usd_volume_30d', 'usd_liquidity_latest']}
			orderColumnIndex={3}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 2.25rem;
	}

	.summary-data {
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
	}

	.block-info {
		display: grid;
		gap: 1.5rem;
		grid-template-rows: 1fr 1fr;

		@media (--viewport-md-down) {
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 1fr;
			gap: 0.75rem;
		}
	}

	.explorer-wrapper {
		gap: 1rem;
		margin-top: 1.75rem;

		@media (--viewport-md-down) {
			margin-top: 0;
			gap: 0.75rem;
		}

		& header {
			display: grid;
			gap: 0.75rem;
			margin-block: 1.5rem;

			@media (--viewport-md-down) {
				margin-block: 1rem;
			}
		}

		& p {
			font: var(--f-h4-roman);

			@media (--viewport-md-down) {
				font: var(--f-h5-roman);
			}
		}
	}
</style>
