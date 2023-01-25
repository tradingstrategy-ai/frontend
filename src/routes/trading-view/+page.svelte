<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { formatAmount, formatSizeGigabytes } from '$lib/helpers/formatters';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import { ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';

	export let data: PageData;
</script>

<svelte:head>
	<title>DEX trading view</title>
	<meta name="description" content="DEX trading view" />
</svelte:head>

<ContentCardsTemplate pageTitle="DEX trading view" pageDescription="DEX trading view">
	<HeroBanner
		slot="hero"
		image={heroImage}
		title="Trading data"
		subtitle="Explore and download trading data from multiple blockchains and decentralised exchanges."
	/>

	<ContentCardsSection title="Explore data">
		<ContentCard icon="blockchain" title="Blockchains" ctaLabel="Explore blockchains" href="/trading-view/blockchains">
			<p>Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.</p>
			{#if data}
				<p>Currently indexing data from <strong>4 blockchains</strong></p>
			{/if}
		</ContentCard>

		<ContentCard icon="exchange" title="DEXes" ctaLabel="Browse DEXes" href="/trading-view/exchanges">
			<p>
				Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain
				trades, across multiple DEXs.
			</p>
			{#if data}
				<p>Currently indexing data from <strong>{formatAmount(data.exchanges)} DEXes</strong></p>
			{/if}
		</ContentCard>

		<ContentCard icon="pair" title="Trading pairs" ctaLabel="Browse trading pairs" href="/trading-view/trading-pairs">
			<p>
				Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and
				current datasets here.
			</p>
			{#if data}
				<p>Currently indexing data from <strong>{formatAmount(data.pairs)} trading pairs</strong></p>
			{/if}
		</ContentCard>

		<ContentCard icon="search" title="Advanced search" ctaLabel="Search tokens" href="/search">
			<p>
				Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price
				change.
			</p>
			{#if data}
				<p>Explore tokens using advanced token search.</p>
			{/if}
		</ContentCard>
	</ContentCardsSection>

	<ContentCardsSection title="Programmatic access">
		<ContentCard icon="backtesting" title="Backtesting" ctaLabel="Download datasets" href="/trading-view/backtesting">
			<p>
				Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for
				calculating past slippage. Datasets are served in Parquet file format.
			</p>
			{#if data}
				<p>Currently providing <strong>{formatSizeGigabytes(data.database_size)} GB worth of data</strong></p>
			{/if}
		</ContentCard>

		<ContentCard
			icon="24h"
			title="Realtime API"
			ctaLabel="Read API specification"
			href="https://tradingstrategy.ai/api/explorer/"
		>
			<p>Connect your trading algorithms for real-time market feeds for live trading.</p>
			<p>Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed.</p>
		</ContentCard>

		<ContentCard
			icon="book"
			title="Documentation"
			ctaLabel="Read documentation"
			href="https://tradingstrategy.ai/docs"
			description="Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges. Read API documentation and tutorials to learn how to create your own strategies."
		/>

		<ContentCard
			icon="python"
			title="Notebooks"
			ctaLabel="Go to notebooks"
			href="https://tradingstrategy.ai/docs/programming/strategy-examples/index.html"
			description="Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies. View example notebooks to see how to use DeFi data in your notebooks."
		/>
	</ContentCardsSection>
</ContentCardsTemplate>
