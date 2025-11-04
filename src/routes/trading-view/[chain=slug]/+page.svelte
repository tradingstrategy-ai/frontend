<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ChainHeader from './ChainHeader.svelte';
	import SummaryDataTile from './SummaryDataTile.svelte';
	import BlockInfoTile from './BlockInfoTile.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import TopEntities from './TopEntities.svelte';
	import TopExchanges from './TopExchanges.svelte';
	import TopPairs from './TopPairs.svelte';
	import TopTokens from './TopTokens.svelte';
	import TopReserves from './TopReserves.svelte';
	import { formatAmount } from '$lib/helpers/formatters';

	const { data } = $props();
	const { chain, chainDetails, topVaults } = data;
</script>

<svelte:head>
	<title>{chain.name} decentralised exchanges and trading pairs</title>
	<meta name="description" content={`Top ${chain.name} tokens and prices`} />
</svelte:head>

<Breadcrumbs labels={{ [chain.slug]: chain.name }} />

<main>
	<ChainHeader name={chain.name} slug={chain.slug} homepage={chain.homepage} />

	<section class="ds-container summary-data" data-testid="chain-summary">
		<div class="block-info">
			<BlockInfoTile title="Last indexed block" count={chainDetails.end_block} timestamp={chainDetails.last_swap_at} />
			<BlockInfoTile title="First indexed block" count={chainDetails.start_block} />
		</div>

		<SummaryDataTile
			count={chainDetails.exchanges}
			title="Exchanges"
			buttonLabel="See exchanges"
			href="{chain.slug}/exchanges"
		>
			Decentralised exchanges with market data available on Trading Strategy.
		</SummaryDataTile>

		<SummaryDataTile
			count={chainDetails.pairs}
			title="Trading pairs"
			buttonLabel="See trading pairs"
			href="{chain.slug}/trading-pairs"
		>
			Total trading pairs available on Trading Strategy. {formatAmount(chainDetails.tracked_pairs)} have active market data
			feeds.
			<a
				class="body-link targetable-above"
				href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				rel="external"
			>
				View inclusion criteria
			</a>
		</SummaryDataTile>

		<SummaryDataTile
			count={topVaults?.vaults.length}
			title="Top vaults"
			buttonLabel="See vaults"
			href="{chain.slug}/vaults"
		>
			Top performing DeFi vaults on {chain.name} with a minimum TVL of $50k USD.
		</SummaryDataTile>
	</section>

	<section class="ds-container trading-entities">
		<h2>{chain.name} trading entities</h2>
		<Grid cols={2} gap="lg">
			<TopEntities
				type="exchanges"
				title="Highest volume exchanges"
				chain={chainDetails}
				data={data.exchanges}
				tableComponent={TopExchanges}
				rightColHeader="Vol 30d"
			/>

			<TopEntities
				type="trading-pairs"
				label="pairs"
				title="Highest TVL trading pairs"
				chain={chainDetails}
				data={data.pairs}
				tableComponent={TopPairs}
				rightColHeader="TVL"
			/>

			<TopEntities
				type="tokens"
				title="Highest liquidity tokens"
				chain={chainDetails}
				data={data.tokens}
				tableComponent={TopTokens}
				rightColHeader="Liquidity"
			/>

			<TopEntities
				type="lending"
				label="reserves"
				title="Highest TVL lending reserves"
				chain={chainDetails}
				data={data.reserves}
				tableComponent={TopReserves}
				rightColHeader="TVL"
			/>
		</Grid>
	</section>
</main>

<style>
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

	.trading-entities {
		h2 {
			margin-block: var(--space-lg);
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}
</style>
