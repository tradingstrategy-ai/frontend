<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ChainHeader from './ChainHeader.svelte';
	import SummaryDataTile from './SummaryDataTile.svelte';
	import BlockInfoTile from './BlockInfoTile.svelte';
	import { AlertItem, AlertList, Button, Grid, SummaryBox } from '$lib/components';
	import TopExchanges from './TopExchanges.svelte';

	export let data;
	const { chain } = data;
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
			href="?tab=exchanges#exchanges"
		/>

		<SummaryDataTile
			count={chain.pairs}
			title="Tracked trading pairs"
			description="Total trading pairs on Trading Strategy for this blockchain."
			buttonLabel="See trading pairs"
			href="?tab=pairs#pairs"
		/>

		<SummaryDataTile
			count={chain.tracked_pairs}
			title="Active trading pairs"
			description="Trading pairs with market data feeds. Active trading pairs have enough trading activity to have data feeds generated for them."
			buttonLabel="See inclusion criteria"
			href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
		/>
	</section>

	<section class="ds-container trading-entities">
		<h2>{chain.chain_name} trading entities</h2>
		<Grid cols={2} gap="lg">
			<SummaryBox title="Highest volume exchanges" ctaPosition="bottom">
				{#await data.streamed.exchanges}
					<TopExchanges loading />
				{:then rows}
					<TopExchanges {rows} />
				{:catch}
					<AlertList>
						<AlertItem>An error occurred loading exchanges. Try reloading the page.</AlertItem>
					</AlertList>
				{/await}

				<Button slot="cta" href="/trading-view/${chain.chain_slug}/exchanges">
					View all {chain.chain_name} DEXes
				</Button>
			</SummaryBox>
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
		& h2 {
			margin-block: var(--space-lg);
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}
</style>
