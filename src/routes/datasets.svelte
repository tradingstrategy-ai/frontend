<script context="module">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a
	export async function load({ page, session, fetch, context }) {
		const url = `https://candlelightdinner.capitalgram.com/datasets`;
		const res = await fetch(url);

		const datasets = await res.json();

		if (res.ok) {
			return {
				props: {
					datasets
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}

</script>

<script>
	import Time from "svelte-time";
	export let datasets;

	function formatNumber(n) {
		if(n <= 1000) {
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
		} else{
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
		}
	}

	function formatSize(n) {
		if(n <= 1024*1024) {
			return (n/(1024*1024)).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
		} else{
			return (n/(1024*1024)).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
		}
	}
</script>

<svelte:head>
	<title>On-chain quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for decentralised exchanges and blockchains">
</svelte:head>

<div class="container">
	<section class="md-12">
		<div class="card">
			<div class="card-body">
				<h1>DeFi datasets</h1>

				<p>
					The following on-chain trade and liquidity datasets are available for decentralised finance research,
					cryptocurrency algorithmic trading, automated trading strategy research and execution.
					You can download the datasets with <a href="https://docs.capitalgram.com/">Capitalgram Python client.</a>
				</p>

				<p>
					These datasets contain trade and liquidity data from several blockchains and
					<a href="https://docs.capitalgram.com/glossary.html#term-AMM">automatic market maker</a> exchanges. The supported blockchains include popular
					Ethereum, Binance Smart Chain and Polygon chains.
				</p>

				<p>
					Datasets are large. We expect you to download the dataset, cache the resulting file on a local disk and
					perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute
					candle data takes several gigabyte of memory.
				</p>

				<p>
					Datasets are distributed either in <a href="https://arrow.apache.org/">compressed Parquet</a> or JSON file formats.
					Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.
				</p>


				<h2>Learn more</h2>

				<ul>
					<li>
						<a href="https://docs.capitalgram.com/">Getting started</a>
					</li>
					<li>
						<a href="https://docs.capitalgram.com/">Documentation</a>
					</li>
					<li>
						<a href="https://github.com/miohtama/capitalgram-onchain-dex-quant-data">Github</a>
					</li>
				</ul>

				<h2>Available datasets</h2>

				<div class="table-responsive">
					<table class="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Tag</th>
								<th>Entry count (k)</th>
								<th>Size (MBytes)</th>
								<th>Format</th>
								<th>Last updated</th>
								<th>Links</th>
							</tr>
						</thead>

						<tbody>
							{#each datasets as row }
								<tr>
									<td>{row.name}</td>
									<td>{row.designation}</td>
									<td>{formatNumber(row.entries)}</td>
									<td>{formatSize(row.size)}</td>
									<td>{row.format}</td>
									<td>
										<Time relative timestamp="{new Date(row.last_updated_at * 1000)}" />
									</td>
									<td>
										<a href={row.documentation}>
											Documentation
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

			</div>
		</div>
	</section>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}

	.card-body a {
	  color: #b68300;
	  text-decoration: none;
	  font-weight: bold;
	  transition: 0.3s;
	}

	.card-body a:hover {
	  text-decoration: underline;
	  color: #eeb302;
	}

</style>
