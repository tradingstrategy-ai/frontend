<script lang="ts">
	import { backendUrl } from '$lib/config';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button, Alert, Select, TextInput } from '$lib/components';

	export let data;
	const { exchange } = data;

	const isUniswapV3 = exchange.exchange_type === 'uniswap_v3';
	const exchangeName = exchange.human_readable_name;
	const downloadUrl = `${backendUrl}/pairs`;

	// Download options
	let selectedFormat = 'excel';
	let selectedDataset = 'top_3000_rows';
	let selectedSort = 'price_change_24h';

	// Uniswap v3 does not have liquidity data available in
	// the same format, so this cannot be used for filtering
	let selectedFilter = isUniswapV3 ? 'unfiltered' : 'min_liquidity_1M';

	let downloadDisabled = false;

	const breadcrumbs = {
		[exchange.chain_slug]: exchange.chain_name,
		[exchange.exchange_slug]: exchangeName,
		'export-data': 'Export data'
	};

	// svelte-ignore reactive_declaration_non_reactive_property
	$: downloadParams = new URLSearchParams({
		chain_slugs: exchange.chain_slug,
		exchange_slugs: exchange.exchange_slug,
		export_format: selectedFormat,
		filter: selectedFilter,
		sort: selectedSort,
		direction: 'desc'
	});
</script>

<svelte:head>
	<title>
		Export {exchangeName} data from {exchange.chain_name} blockchain
	</title>
	<meta name="description" content="Download {exchangeName} on {exchange.chain_name} trading pair data as Excel file" />
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<header class="ds-container">
		<h1>Export trading pair data for {exchangeName}</h1>

		<p>
			Download the exchange top trading pairs as Microsoft Excel file for analysis. This analysis is suitable for quick
			market overview.
			<a class="body-link" href="/trading-view/backtesting">
				For comprehensive analysis use the full backtesting datasets
			</a>.
		</p>
	</header>

	<section class="ds-container">
		<form on:change={() => (downloadDisabled = false)}>
			<div>
				<label for="exchange_name">Selected exchange</label>
				<TextInput size="xl" id="exchange_name" disabled value={exchangeName} />
			</div>

			<div>
				<label for="export_format">Export format</label>
				<Select class="form-control" id="export_format" bind:value={selectedFormat}>
					<option value="excel">Microsoft Excel .xlsx</option>
				</Select>
			</div>

			<div>
				<label for="export_dataset">Dataset</label>
				<Select class="form-control" id="export_dataset" bind:value={selectedDataset}>
					<option value="top_3000_rows">Top 3000 pairs</option>
				</Select>
			</div>

			<div>
				<label for="export_dataset">Sorted by</label>
				<Select class="form-control" id="sorted_by" bind:value={selectedSort}>
					<option value="liquidity_change_relative_24h">Liquidity % change 24h</option>
					<option value="liquidity_change_abs_24h">Liquidity USD change 24h</option>
					<option value="liquidity">Liquidity available latest</option>
					<option value="volume_1d">Volume 24h</option>
					<option value="price_change_24h">Price change 24h</option>
				</Select>
			</div>

			<div>
				<label for="export_dataset">Filter</label>
				<Select class="form-control" id="filter" bind:value={selectedFilter}>
					<option value="unfiltered">Unfiltered</option>
					<!-- Uniswap v3 hot fix until data is available -->
					{#if !isUniswapV3}
						<option value="min_liquidity_100k">Min. liquidity $100k</option>
						<option value="min_liquidity_1M">Min. liquidity $1M</option>
					{/if}
				</Select>
			</div>

			<div class="cta">
				<Button
					label="Download Excel"
					href="{downloadUrl}?{downloadParams}"
					download
					disabled={downloadDisabled}
					on:click={() => (downloadDisabled = true)}
				/>

				<Button secondary label="View full datasets" href="/trading-view/backtesting" />
			</div>
		</form>
	</section>

	<section class="ds-container footnote">
		<p>Exported data is useful e.g. for analysis of new tokens entering the market.</p>
		<p>
			This data export contains only data for
			<a class="body-link" href="/trading-view/{exchange.chain_slug}/{exchange.exchange_slug}">{exchangeName}</a>. Read
			about
			<a class="body-link" target="_blank" rel="external" href="https://tradingstrategy.ai/api/explorer/"
				>the column format in PairSummary section of the API documentation.</a
			>
		</p>

		<Alert status="warning" title="Microsoft Excel export is currently in beta">
			We are still finishing out data points. Some data might be incorrect or not available.
		</Alert>
	</section>
</main>

<style>
	main {
		--container-max-width: 720px;
		display: grid;
		gap: var(--space-lg);
	}

	.ds-container {
		gap: var(--space-md);
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	form {
		display: grid;
		gap: var(--space-md);

		div {
			display: grid;
			gap: var(--space-xxs);
		}
	}

	label {
		font: var(--f-ui-small-medium);
	}

	.cta {
		margin-top: var(--space-md);
		padding-block: var(--space-lg);
		display: flex;
		gap: var(--space-xl);

		@media (--viewport-xs) {
			padding-block: 0;
			flex-direction: column;
			gap: var(--space-ls);
		}
	}
</style>
