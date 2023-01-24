<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { formatAmount, formatSizeGigabytes } from '$lib/helpers/formatters';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import { Button, ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';

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
		<ContentCard
			href="/trading-view/blockchains"
			iconName="blockchain"
			title="Blockchains"
			subtitle="Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.  <br /><br />Currently indexing data from <strong>4 blockchains</strong>."
		>
			<Button slot="cta">Explore blockchains</Button>
		</ContentCard>
		<ContentCard
			href="/trading-view/exchanges"
			iconName="exchange"
			title="DEXes"
			subtitle="Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain trades, across multiple DEXs. <br /><br />Currently indexing data from <strong>{formatAmount(
				data.exchanges
			)} DEXes</strong>"
		>
			<Button slot="cta">Browse DEXes</Button>
		</ContentCard>
		<ContentCard
			href="/trading-view/trading-pairs"
			iconName="pair"
			title="Trading pairs"
			subtitle="Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and current datasets here. <br /><br /> Currently indexing data from <strong>{formatAmount(
				data.exchanges
			)} DEXes</strong>"
		>
			<Button slot="cta">Browse trading pairs</Button>
		</ContentCard>
		<ContentCard
			href="/search"
			iconName="search"
			title="Advanced search"
			subtitle="Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price change."
		>
			<Button slot="cta">Search tokens</Button>
		</ContentCard>
	</ContentCardsSection>

	<ContentCardsSection title="Programmatic access">
		<ContentCard
			href="/trading-view/backtesting"
			iconName="backtesting"
			title="Backtesting"
			subtitle="Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for calculating past slippage. Datasets are served in Parquet file format."
		>
			<Button slot="cta">Download datasets</Button>
		</ContentCard>
		<ContentCard
			href="https://tradingstrategy.ai/api/explorer/"
			iconName="24h"
			title="Realtime API"
			subtitle="Connect your trading algorithms for real-time market feeds for live trading.<br /> Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed."
		>
			<Button slot="cta">Read API specification</Button>
		</ContentCard>
		<ContentCard
			href="https://tradingstrategy.ai/docs"
			iconName="book"
			title="Documentation"
			subtitle="Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges. Read API documentation and tutorials to learn how to create your own strategies."
		>
			<Button slot="cta">Read documentation</Button>
		</ContentCard>
		<ContentCard
			href="https://tradingstrategy.ai/docs/programming/strategy-examples/index.html"
			iconName="python"
			title="Notebooks"
			subtitle="Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies. View example notebooks to see how to use DeFi data in your notebooks."
		>
			<Button slot="cta">Go to notebooks</Button>
		</ContentCard>
	</ContentCardsSection>
</ContentCardsTemplate>
