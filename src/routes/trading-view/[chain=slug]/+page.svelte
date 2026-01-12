<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ChainHeader from './ChainHeader.svelte';
	import SummaryDataTile from './SummaryDataTile.svelte';
	import BlockInfoTile from './BlockInfoTile.svelte';
	import TradingEntities from './TradingEntities.svelte';
	import { formatAmount } from '$lib/helpers/formatters';
	import { max } from 'd3-array';

	let { data } = $props();
	let { chain, chainDetails, topVaults, entities } = $derived(data);

	let lastIndexedBlock = $derived.by(() => {
		if (chainDetails) {
			return chainDetails.end_block;
		} else if (topVaults) {
			return max(topVaults.vaults, (d) => d.last_updated_block);
		}
	});

	let lastUpdatedTimestamp = $derived.by(() => {
		if (chainDetails) {
			return chainDetails.last_swap_at;
		} else if (topVaults) {
			return max(topVaults.vaults, (d) => d.last_updated_at);
		}
	});
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
			<BlockInfoTile title="Last indexed block" count={lastIndexedBlock} timestamp={lastUpdatedTimestamp} />
			<BlockInfoTile title="First indexed block" count={chainDetails?.start_block} />
		</div>

		<SummaryDataTile
			count={chainDetails?.exchanges}
			title="Exchanges"
			buttonLabel="See exchanges"
			href="{chain.slug}/exchanges"
		>
			Decentralised exchanges with market data available on Trading Strategy.
		</SummaryDataTile>

		<SummaryDataTile
			count={chainDetails?.pairs}
			title="Trading pairs"
			buttonLabel="See trading pairs"
			href="{chain.slug}/trading-pairs"
		>
			Total trading pairs available on Trading Strategy.
			{formatAmount(chainDetails?.tracked_pairs ?? 0)}
			pairs have active market data feeds.
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

	<section class="ds-container">
		{#if chain.hasBackendData && chainDetails}
			<TradingEntities {chain} {entities} />
		{:else}
			<Alert status="info" title="Limited chain data">
				We currently offer limited data for {chain.name} blockchain. View
				<a href="./vaults">top {chain.name} DeFi vaults</a>.
			</Alert>
		{/if}
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
</style>
