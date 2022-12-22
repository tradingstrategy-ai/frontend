<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { formatAmount, formatSizeGigabytes } from '$lib/helpers/formatters';
	import { Hero, ContentTile } from '$lib/components';
	import HeroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';

	export let data: PageData;
</script>

<svelte:head>
	<title>DEX trading view</title>
	<meta name="description" content="DEX trading view" />
</svelte:head>

<main>
	<Hero title="Trading data" image={HeroImage}>
		Explore and download trading data from multiple blockchains and decentralised exchanges.
	</Hero>

	<div class="section-wrapper">
		<section class="ds-container">
			<h2>Explore data</h2>

			<ContentTile
				title="Blockchains"
				icon="blockchain"
				targetUrl="/trading-view/blockchains"
				buttonLabel="View blockchains"
			>
				<p>Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.</p>
				{#if data}
					<p>Currently indexing data from {data.blockchains} blockchains.</p>
				{/if}
			</ContentTile>

			<ContentTile
				title="Decentralised exchanges"
				icon="exchange"
				targetUrl="/trading-view/exchanges"
				buttonLabel="View exchanges"
			>
				<p>
					Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain
					trades, across multiple DEXs.
				</p>
				{#if data}
					<p>Currently indexing data from {formatAmount(data.exchanges)} decentralised exchanges.</p>
				{/if}
			</ContentTile>

			<ContentTile
				title="Trading pairs"
				icon="pair"
				targetUrl="/trading-view/trading-pairs"
				buttonLabel="View trading pairs"
			>
				<p>
					Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and
					current datasets here.
				</p>
				{#if data}
					<p>Currently indexing data from {formatAmount(data.pairs)} trading pairs.</p>
				{/if}
			</ContentTile>

			<ContentTile title="Advanced token search" icon="search" targetUrl="/search" buttonLabel="Search tokens">
				<p>
					Search tokens across multiple blockchains and exchanges. Sort and filter by liquidity, volume and/or price
					change.
				</p>
				<p>Explore tokens using advanced token search.</p>
			</ContentTile>
		</section>

		<section class="ds-container">
			<h2>Programmatic access</h2>

			<ContentTile
				title="Backtesting"
				icon="backtesting"
				targetUrl="/trading-view/backtesting"
				buttonLabel="Download datasets"
			>
				<p>
					Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for
					calculating past slippage. Datasets are served in Parquet file format.
				</p>
				{#if data}
					<p>Currently have {formatSizeGigabytes(data.database_size)} GB worth of data available.</p>
				{/if}
			</ContentTile>

			<ContentTile
				title="Realtime API"
				icon="24h"
				targetUrl="https://tradingstrategy.ai/api/explorer/"
				buttonLabel="Read API specification"
				external={true}
			>
				<p>Connect your trading algorithms for real-time market feeds for live trading.</p>
				<p>Real-time API is available in OpenAPI v3 format, no API keys or sign ups needed.</p>
			</ContentTile>

			<ContentTile
				title="Documentation"
				icon="book"
				targetUrl="https://tradingstrategy.ai/docs"
				buttonLabel="Read documentation"
			>
				<p>
					Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges.
					Read API documentation and tutorials to learn how to create your own strategies.
				</p>
			</ContentTile>

			<ContentTile
				title="Notebooks"
				icon="python"
				targetUrl="https://tradingstrategy.ai/docs/programming/strategy-examples/index.html"
				buttonLabel="Go to notebooks"
			>
				<p>
					Use popular Jupyter Notebook, Pandas and other data science libraries to model and backtest your strategies.
					View example notebooks to see how to use DeFi data in your notebooks.
				</p>
			</ContentTile>
		</section>
	</div>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-xxxl);
	}

	.section-wrapper {
		display: grid;
		gap: 4.5rem;
	}

	section {
		grid-template-columns: repeat(auto-fit, minmax(min(var(--container-width), 29.5rem), 1fr));
		gap: var(--space-xl);
	}

	section h2 {
		grid-column: 1 / -1;
	}

	@media (--viewport-md-up) {
		.section-wrapper {
			gap: 6.25rem;
		}
	}
</style>
