<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { formatAmount, formatSizeGigabytes } from '$lib/helpers/formatters';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import { ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';

	export let data: PageData;
	const { impressiveNumbers } = data;
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
		<ContentCard
			href="/trading-view/blockchains"
			iconName="blockchain"
			title="Blockchains"
			subtitle="Trading Strategy provides powerful market data sets for on-chain trading on several blockchains."
			summaryLabel="Indexing data from"
			summaryValue="{impressiveNumbers.blockchains} blockchains"
		/>
		<ContentCard
			href="/trading-view/exchanges"
			iconName="exchange"
			title="DEXes"
			subtitle="Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain trades, across multiple DEXs."
			summaryLabel="Indexing data from"
			summaryValue="{formatAmount(impressiveNumbers.exchanges)} DEXes"
		/>
		<ContentCard
			href="/trading-view/trading-pairs"
			iconName="pair"
			title="Trading pairs"
			subtitle="Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and current datasets here."
			summaryLabel="Indexing data from"
			summaryValue="{formatAmount(impressiveNumbers.pairs)} trading pairs"
		/>
		<ContentCard
			href="/trading-view/exchanges"
			iconName="search"
			title="Advanced search"
			subtitle="Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price change."
			summaryLabel="Browse data and customise results"
			summaryValue="32 filters"
		/>
	</ContentCardsSection>

	<ContentCardsSection title="Programmatic access">
		<ContentCard
			href="/trading-view/backtesting"
			iconName="backtesting"
			title="Backtesting"
			subtitle="Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for calculating past slippage. Datasets are served in Parquet file format."
			summaryLabel="You can download"
			summaryValue="{formatSizeGigabytes(impressiveNumbers.database_size)} GB worth of data"
		/>
		<ContentCard
			href="https://tradingstrategy.ai/api/explorer/"
			iconName="24h"
			title="Realtime API"
			subtitle="Connect your trading algorithms for real-time market feeds for live trading.<br /> Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed."
			summaryLabel="Available format"
			summaryValue="OpenAPI v3"
		/>
		<ContentCard
			href="https://tradingstrategy.ai/docs"
			iconName="book"
			title="Documentation"
			subtitle="Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges. Read API documentation and tutorials to learn how to create your own strategies."
			summaryLabel="Technical documentation"
			summaryValue="For strategy developers"
		/>
		<ContentCard
			href="https://tradingstrategy.ai/docs/programming/strategy-examples/index.html"
			iconName="python"
			title="Notebooks"
			subtitle="Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies. View example notebooks to see how to use DeFi data in your notebooks."
			summaryLabel="Available examples for"
			summaryValue="Jupyter Notebook, Pandas"
		/>
	</ContentCardsSection>
</ContentCardsTemplate>
