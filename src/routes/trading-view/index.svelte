<!--
	Trading data splash page renderer
-->
<script context="module">
	export async function load({ fetch, session }) {
		const { backendUrl } = session.config;
		const impressiveNumbersResp = await fetch(`${backendUrl}/impressive-numbers`);
		let impressiveNumbers;

		// render the page even if the backend is down
		if (impressiveNumbersResp.ok) {
			impressiveNumbers = await impressiveNumbersResp.json();
		} else {
			console.error('API error', impressiveNumbersResp);
		}

		return {
			props: { impressiveNumbers }
		};
	}
</script>

<script>
	import { formatAmount, formatSizeGigabytes } from '$lib/helpers/formatters';
	import Hero from '$lib/components/Hero.svelte';
	import DataImage from '$lib/assets/milano/dev/data-cloud-1.svg?raw';
	import ContentTile from '$lib/components/ContentTile.svelte';

	export let impressiveNumbers;
</script>

<svelte:head>
	<title>DEX trading view</title>
	<meta name="description" content="DEX trading view" />
</svelte:head>

<main>
	<Hero title="Trading data" image={DataImage}>
		Explore and download trading data from multiple blockchains and decentralised exchanges.
	</Hero>

	<section class="ds-container">
		<h2>Explore data</h2>

		<ContentTile
			horizontal
			title="Blockchains"
			icon="blockchain"
			targetUrl="/trading-view/blockchains"
			buttonLabel="View blockchains"
		>
			<p>Trading Strategy provides powerful market data sets for on-chain trading on several blockchains.</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from {impressiveNumbers.blockchains} blockchains.</p>
			{/if}
		</ContentTile>

		<ContentTile
			horizontal
			title="Decentralised exchanges"
			icon="exchange"
			targetUrl="/trading-view/exchanges"
			buttonLabel="View exchanges"
		>
			<p>
				Trading Strategy provides data sets for decentralised exchanges. All market data is sourced from on-chain
				trades, across multiple DEXs.
			</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from {formatAmount(impressiveNumbers.exchanges)} decentralised exchanges.</p>
			{/if}
		</ContentTile>

		<ContentTile
			horizontal
			title="Trading pairs"
			icon="pair"
			targetUrl="/trading-view/trading-pairs"
			buttonLabel="View trading pairs"
		>
			<p>
				Trading pairs have OHLCV candle data available between 1-minute to 30-day time frames. View historical and
				current datasets here.
			</p>
			{#if impressiveNumbers}
				<p>Currently indexing data from {formatAmount(impressiveNumbers.pairs)} trading pairs.</p>
			{/if}
		</ContentTile>

		<ContentTile horizontal title="Advanced token search" icon="search" targetUrl="/search" buttonLabel="Search tokens">
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
			horizontal
			title="Backtesting"
			icon="backtesting"
			targetUrl="/trading-view/backtesting"
			buttonLabel="Download datasets"
		>
			<p>
				Download historical OHLCV data for backtesting your trading algorithms. Liquidity information is available for
				calculating past slippage. Datasets are served in Parquet file format.
			</p>
			{#if impressiveNumbers}
				<p>Currently have {formatSizeGigabytes(impressiveNumbers.database_size)} GB worth of data available.</p>
			{/if}
		</ContentTile>

		<ContentTile
			horizontal
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
			horizontal
			title="Documentation and notebooks"
			icon="python"
			targetUrl="https://tradingstrategy.ai/docs/programming/index.html"
			buttonLabel="Read documentation"
		>
			<p>
				Trading Strategy supports popular quantitative finance toolkits for Python programming language. Use popular
				Jupyter Notebooks, Pandas and other libraries to crunch through the data.
			</p>
			<p>Documentation contains tutorials and examples for starting algorithmic trading.</p>
		</ContentTile>
	</section>
</main>

<style>
	section {
		grid-template-columns: 1fr;
		gap: 2rem;
		padding-top: 2rem;
		padding-bottom: 2rem;
	}

	section h2 {
		font: var(--f-h3-medium);
	}
</style>
