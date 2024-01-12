<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import { formatAmount, formatByteUnits } from '$lib/helpers/formatters';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import { ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';

	export let data;
	const { impressiveNumbers } = data;
</script>

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
			{#if impressiveNumbers}
				<p>Currently indexing data from <strong>{formatAmount(impressiveNumbers.blockchains)} blockchains</strong></p>
			{/if}
		</ContentCard>

		<ContentCard icon="exchange" title="DEXes" ctaLabel="Browse DEXes" href="/trading-view/exchanges">
			<p>
				Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain
				trades, across multiple DEXs.
			</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from <strong>{formatAmount(impressiveNumbers.exchanges)} DEXes</strong></p>
			{/if}
		</ContentCard>

		<ContentCard icon="pair" title="Trading pairs" ctaLabel="Browse trading pairs" href="/trading-view/trading-pairs">
			<p>
				Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and
				current datasets here.
			</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from <strong>{formatAmount(impressiveNumbers.pairs)} trading pairs</strong></p>
			{/if}
		</ContentCard>

		<ContentCard
			icon="lending-reserve"
			title="Lending reserves"
			ctaLabel="Browse reserves "
			href="/trading-view/lending-reserves"
		>
			<p>
				View current and historical interest rate data for common Aave v3 lending reserves across multiple blockchains.
			</p>
			{#if impressiveNumbers}
				<p>
					Currently indexing data from
					<strong>{formatAmount(impressiveNumbers.lending_reserves)} lending reserves</strong>
				</p>
			{/if}
		</ContentCard>

		<ContentCard icon="search" title="Advanced search" ctaLabel="Search tokens" href="/search">
			<p>
				Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price
				change.
			</p>
			{#if impressiveNumbers}
				<p>Explore tokens using advanced token search.</p>
			{/if}
		</ContentCard>

		<ContentCard icon="dictionary" title="DeFi and Trading Dictionary" ctaLabel="View dictionary" href="/glossary">
			<p>Browse and learn DeFi, trading and technical analysis terminology.</p>
		</ContentCard>
	</ContentCardsSection>

	<ContentCardsSection title="Programmatic access">
		<ContentCard icon="backtesting" title="Backtesting" ctaLabel="Download datasets" href="/trading-view/backtesting">
			<p>
				Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for
				calculating past slippage. Datasets are served in Parquet file format.
			</p>
			{#if impressiveNumbers}
				<p>
					Currently providing <strong>{formatByteUnits(impressiveNumbers.database_size)} of data</strong>
				</p>
			{/if}
		</ContentCard>

		<ContentCard
			icon="24h"
			title="Realtime API"
			ctaLabel="Read API specification"
			href="https://tradingstrategy.ai/api/explorer/"
			rel="external"
		>
			<p>Connect your trading algorithms for real-time market feeds for live trading.</p>
			<p>Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed.</p>
		</ContentCard>

		<ContentCard
			icon="book"
			title="Documentation"
			ctaLabel="Read documentation"
			href="https://tradingstrategy.ai/docs"
			rel="external"
			description="Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges. Read API documentation and tutorials to learn how to create your own strategies."
		/>

		<ContentCard
			icon="python"
			title="Notebooks"
			ctaLabel="Go to notebooks"
			href="https://tradingstrategy.ai/docs/programming/strategy-examples/index.html"
			rel="external"
			description="Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies. View example notebooks to see how to use DeFi data in your notebooks."
		/>
	</ContentCardsSection>
</ContentCardsTemplate>
