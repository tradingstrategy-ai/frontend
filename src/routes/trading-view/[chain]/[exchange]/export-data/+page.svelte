<script lang="ts">
	import type { PageData } from './$types';
	import { backendUrl } from '$lib/config';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button } from '$lib/components';

	export let data: PageData;

	const exchangeName = data.human_readable_name;
	const downloadUrl = `${backendUrl}/pairs`;

	// Download options
	let selectedFormat = 'excel';
	let selectedDataset = 'top_3000_rows';
	let selectedSort = 'price_change_24h';
	let selectedFilter = 'min_liquidity_1M';
	let downloadDisabled = false;

	$: breadcrumbs = {
		[data.exchange_slug]: exchangeName,
		'export-data': 'Export data'
	};

	$: downloadParams = new URLSearchParams({
		chain_slugs: data.chain_slug,
		exchange_slugs: data.exchange_slug,
		export_format: selectedFormat,
		filter: selectedFilter,
		sort: selectedSort,
		direction: 'desc'
	});
</script>

<svelte:head>
	<title>
		Export {exchangeName} on ${data.chain_name} data
	</title>
	<meta name="description" content={`Download ${exchangeName} on ${data.chain_name} trading pair data as Excel file`} />
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<header class="ds-container">
		<h1>Export trading pair data for {exchangeName}</h1>
		<p>Download data as Microsoft Excel file for analysis.</p>
	</header>

	<section class="ds-container">
		<form>
			{#if data.exchange_slug}
				<div>
					<label for="exampleFormControlInput1">Selected exchange</label>
					<input type="text" class="form-control" id="exampleFormControlInput1" disabled value={exchangeName} />
				</div>
			{/if}

			<div>
				<label for="export_format">Export format</label>
				<select class="form-control" id="export_format" bind:value={selectedFormat}>
					<option value="excel">Microsoft Excel .xlsx</option>
				</select>
			</div>

			<div>
				<label for="export_dataset">Dataset</label>
				<select class="form-control" id="export_dataset" bind:value={selectedDataset}>
					<option value="top_3000_rows">Top 3000 pairs</option>
				</select>
			</div>

			<div>
				<label for="export_dataset">Sorted by</label>
				<select class="form-control" id="sorted_by" bind:value={selectedSort}>
					<option value="liquidity_change_24h">Liquidity % change 24h</option>
					<option value="usd_liquidity_change_24h">Liquidity USD change 24h</option>
					<option value="usd_liquidity_latest">Liquidity available latest</option>
					<option value="usd_volume_24h">Volume 24h</option>
					<option value="price_change_24h">Price change 24h</option>
				</select>
			</div>

			<div>
				<label for="export_dataset">Filter</label>
				<select class="form-control" id="filter" bind:value={selectedFilter}>
					<option value="unfiltered">Unfiltered</option>
					<option value="min_liquidity_100k">Min. liquidity $100k</option>
					<option value="min_liquidity_1M">Min. liquidity $1M</option>
				</select>
			</div>

			<div class="cta">
				<Button
					label="Download trading pair data"
					href="{downloadUrl}?{downloadParams}"
					download
					disabled={downloadDisabled}
					on:click={() => (downloadDisabled = true)}
				/>
			</div>
		</form>
	</section>

	<section class="ds-container footnote">
		<p>Exported data is useful e.g. for analysis of new tokens entering the market.</p>
		<p>
			This data export contains only data for
			<a class="body-link" href="/trading-view/{data.chain_slug}/{data.exchange_slug}">{exchangeName}</a>. Read about
			<a class="body-link" rel="external" href="https://tradingstrategy.ai/api/explorer/"
				>the column format in PairSummary section of the API documentation.</a
			>
			For all datasets, see <a class="body-link" href="/trading-view/backtesting">Backtesting</a> page.
		</p>
	</section>
</main>

<style>
	main {
		--container-max-width: 720px;
		display: grid;
		gap: 1.5rem;
	}

	.ds-container {
		gap: 1rem;
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	form {
		display: grid;
		gap: 1rem;
	}

	label {
		font: var(--f-ui-small-medium);
	}

	select,
	input {
		-webkit-appearance: none;
		-moz-appearance: none;
		background: inherit;
		color: inherit;
		border: 1px solid var(--c-border-1);
	}

	input[disabled] {
		background: var(--c-background-2);
	}

	.cta {
		margin-top: 1rem;
		display: grid;
	}

	@media (--viewport-md-up) {
		.cta {
			justify-items: start;
		}
	}
</style>
