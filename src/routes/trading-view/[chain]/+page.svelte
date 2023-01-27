<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import ExchangeExplorer from '$lib/explorer/ExchangeExplorer.svelte';
	import ChainHeader from './ChainHeader.svelte';
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
	<ChainHeader name={data.chain_name} slug={data.chain_slug} homepage={data.homepage} />

	<section class="ds-container summary-data" data-testid="chain-summary">
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

	<section id="exchanges" class="ds-container explorer-wrapper" data-testid="exchanges">
		<header>
			<h2>Exchanges on {data.chain_name}</h2>
			<p>Showing exchanges with trading activity in last 30 days.</p>
		</header>

		<ExchangeExplorer
			chainSlug={data.chain_slug}
			enabledColumns={['human_readable_name', 'pair_count', 'usd_volume_30d']}
			orderColumnIndex={2}
		/>
	</section>

	<section id="trading-pairs" class="ds-container explorer-wrapper" data-testid="trading-pairs">
		<header>
			<h2>Trading pairs on {data.chain_name}</h2>
		</header>
		<PairExplorer
			chainSlug={data.chain_slug}
			enabledColumns={[
				'pair_name',
				'exchange_name',
				'pair_swap_fee',
				'usd_price_latest',
				'usd_volume_30d',
				'usd_liquidity_latest'
			]}
			orderColumnIndex={4}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		--layout-gap: var(--space-lg);

		@media (--viewport-md-down) {
			--layout-gap: var(--space-md);
			--grid-gap: var(--layout-gap);
		}

		display: grid;
		gap: var(--layout-gap);
	}

	.summary-data {
		grid-template-columns: repeat(4, 1fr);
		gap: var(--layout-gap);

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}
	}

	.block-info {
		display: grid;
		gap: var(--space-lg);
		grid-template-rows: 1fr 1fr;

		@media (--viewport-md-down) {
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 1fr;
			gap: var(--space-md);
		}
	}

	h2 {
		font: var(--f-h2-medium);
	}

	.explorer-wrapper {
		gap: var(--space-md);
		margin-top: var(--space-ll);

		@media (--viewport-md-down) {
			margin-top: 0;
			gap: var(--space-sl);
		}

		& header {
			display: grid;
			gap: var(--space-sl);
			margin-block: var(--space-lg);

			@media (--viewport-md-down) {
				margin-block: var(--space-md);
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
