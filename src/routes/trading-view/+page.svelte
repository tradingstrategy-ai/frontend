<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import { formatAmount, formatByteUnits } from '$lib/helpers/formatters';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import { Button, ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';
	import IconBacktesting from '~icons/local/backtesting';
	import Icon24h from '~icons/local/24h';
	import IconBlockchain from '~icons/local/blockchain';
	import IconBook from '~icons/local/book';
	import IconDictionary from '~icons/local/dictionary';
	import IconExchange from '~icons/local/exchange';
	import IconLendingReserve from '~icons/local/lending-reserve';
	import IconPair from '~icons/local/pair';
	import IconPython from '~icons/local/python';
	import IconSearch from '~icons/local/search';

	export let data;
	const { impressiveNumbers } = data;
</script>

<ContentCardsTemplate pageTitle="DEX trading view" pageDescription="DEX trading view">
	<HeroBanner
		slot="hero"
		image={heroImage}
		title="Trading data"
		subtitle="The largest decentralised finance dataset for automated trading."
	/>

	<ContentCardsSection title="Explore data">
		<ContentCard title="Blockchains" href="/trading-view/blockchains">
			<IconBlockchain slot="icon" />
			<p>Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from <strong>{formatAmount(impressiveNumbers.blockchains)} blockchains</strong></p>
			{/if}
			<Button slot="cta" label="Explore blockchains" />
		</ContentCard>

		<ContentCard title="DEXes" href="/trading-view/exchanges">
			<IconExchange slot="icon" />
			<p>
				Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain
				trades, across multiple DEXs.
			</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from <strong>{formatAmount(impressiveNumbers.exchanges)} DEXes</strong></p>
			{/if}
			<Button slot="cta" label="Browse DEXes" />
		</ContentCard>

		<ContentCard title="Trading pairs" href="/trading-view/trading-pairs">
			<IconPair slot="icon" />
			<p>
				Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and
				current datasets here.
			</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from <strong>{formatAmount(impressiveNumbers.pairs)} trading pairs</strong></p>
			{/if}
			<Button slot="cta" label="Browse trading pairs" />
		</ContentCard>

		<ContentCard title="Lending reserves" href="/trading-view/lending-reserves">
			<IconLendingReserve slot="icon" />
			<p>
				View current and historical interest rate data for common Aave v3 lending reserves across multiple blockchains.
			</p>
			{#if impressiveNumbers}
				<p>
					Currently indexing data from
					<strong>{formatAmount(impressiveNumbers.lending_reserves)} lending reserves</strong>
				</p>
			{/if}
			<Button slot="cta" label="Browse reserves" />
		</ContentCard>

		<ContentCard title="Advanced search" href="/search">
			<IconSearch slot="icon" />
			<p>
				Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price
				change.
			</p>
			{#if impressiveNumbers}
				<p>Explore tokens using advanced token search.</p>
			{/if}
			<Button slot="cta" label="Search tokens" />
		</ContentCard>

		<ContentCard title="DeFi and Trading Dictionary" href="/glossary">
			<IconDictionary slot="icon" />
			<p>Browse and learn DeFi, trading and technical analysis terminology.</p>
			<Button slot="cta" label="View dictionary" />
		</ContentCard>
	</ContentCardsSection>

	<ContentCardsSection title="Programmatic access">
		<ContentCard title="Backtesting" href="/trading-view/backtesting">
			<IconBacktesting slot="icon" />
			<p>
				Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for
				calculating past slippage. Datasets are served in Parquet file format.
			</p>
			{#if impressiveNumbers}
				<p>
					Currently providing <strong>{formatByteUnits(impressiveNumbers.database_size)} of data</strong>
				</p>
			{/if}
			<Button slot="cta" label="Download datasets" />
		</ContentCard>

		<ContentCard title="Realtime API" href="https://tradingstrategy.ai/api/explorer/" rel="external">
			<Icon24h slot="icon" />
			<p>Connect your trading algorithms for real-time market feeds for live trading.</p>
			<p>Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed.</p>
			<Button slot="cta" label="Read API specification" />
		</ContentCard>

		<ContentCard title="Documentation" href="https://tradingstrategy.ai/docs" rel="external">
			<IconBook slot="icon" />
			<p>
				Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges.
				Read API documentation and tutorials to learn how to create your own strategies.
			</p>
			<Button slot="cta" label="Read documentation" />
		</ContentCard>

		<ContentCard
			title="Notebooks"
			href="https://tradingstrategy.ai/docs/programming/strategy-examples/index.html"
			rel="external"
		>
			<IconPython slot="icon" />
			<p>
				Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies.
				View example notebooks to see how to use DeFi data in your notebooks.
			</p>
			<Button slot="cta" label="Go to notebooks" />
		</ContentCard>
	</ContentCardsSection>
</ContentCardsTemplate>
