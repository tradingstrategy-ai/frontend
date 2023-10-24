<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ChainHeader from './ChainHeader.svelte';
	import SummaryDataTile from './SummaryDataTile.svelte';
	import BlockInfoTile from './BlockInfoTile.svelte';
	import { Grid } from '$lib/components';
	import TopEntities from './TopEntities.svelte';
	import TopExchanges from './TopExchanges.svelte';
	import TopPairs from './TopPairs.svelte';
	import TopTokens from './TopTokens.svelte';
	import TopReserves from './TopReserves.svelte';

	export let data;
	const { chain, streamed } = data;
</script>

<svelte:head>
	<title>{chain.chain_name} decentralised exchanges and trading pairs</title>
	<meta name="description" content={`Top ${chain.chain_name} tokens and prices`} />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name }} />

<main>
	<ChainHeader name={chain.chain_name} slug={chain.chain_slug} homepage={chain.homepage} />

	<section class="ds-container summary-data" data-testid="chain-summary">
		<div class="block-info">
			<BlockInfoTile title="Last indexed block" count={chain.end_block} timestamp={chain.last_swap_at} />
			<BlockInfoTile title="First indexed block" count={chain.start_block} timestamp={chain.first_swap_at} />
		</div>

		<SummaryDataTile
			count={chain.exchanges}
			title="Exchanges"
			description="Decentralised exchanges with market data available on Trading Strategy"
			buttonLabel="See exchanges"
			href="{chain.chain_slug}/exchanges"
		/>

		<SummaryDataTile
			count={chain.pairs}
			title="Tracked trading pairs"
			description="Total trading pairs on Trading Strategy for this blockchain."
			buttonLabel="See trading pairs"
			href="{chain.chain_slug}/trading-pairs"
		/>

		<SummaryDataTile
			count={chain.tracked_pairs}
			title="Active trading pairs"
			description="Trading pairs with market data feeds. Active trading pairs have enough trading activity to have data feeds generated for them."
			buttonLabel="See inclusion criteria"
			href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
			rel="external"
		/>
	</section>

	<section class="ds-container trading-entities">
		<h2>{chain.chain_name} trading entities</h2>
		<Grid cols={2} gap="lg">
			<TopEntities
				type="exchanges"
				title="Highest volume exchanges"
				{chain}
				data={streamed.exchanges}
				tableComponent={TopExchanges}
				rightColHeader="Vol 30d"
			/>

			<TopEntities
				type="trading-pairs"
				label="pairs"
				title="Highest volume trading pairs"
				{chain}
				data={streamed.pairs}
				tableComponent={TopPairs}
				rightColHeader="Vol 30d"
			/>

			<TopEntities
				type="tokens"
				title="Highest liquidity tokens"
				{chain}
				data={streamed.tokens}
				tableComponent={TopTokens}
				rightColHeader="Liquidity"
			/>

			<TopEntities
				type="lending"
				label="reserves"
				title="Lowest APR lending reserves"
				{chain}
				data={streamed.reserves}
				tableComponent={TopReserves}
				rightColHeader="Borrow APR"
			/>
		</Grid>
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

	.trading-entities {
		h2 {
			margin-block: var(--space-lg);
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}
</style>
