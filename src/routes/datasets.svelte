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
		const url = `https://candlelightdinner.tradingstrategy.ai/datasets`;
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
	<title>DEX trading and quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for DEXes">
</svelte:head>

<div class="container">
	<section class="md-12">
		<div class="card">
			<div class="card-body">
				<h1>On-chain trading data for backtesting</h1>

				<p>
					The following on-chain trade and liquidity datasets are available for decentralised finance (DeFi) research,
					cryptocurrency algorithmic trading, automated trading strategy research and execution.
				</p>

				<p>
					You can download the datasets with an API key. Request an API key via Telegram or <a href="https://tradingstrategy.ai/docs/">Python client.</a>
				</p>

				<h2>Available data</h2>

				<p>
					These datasets contain trade and liquidity data from several blockchains and
					<a href="https://tradingstrategy.ai/docs/glossary.html#term-AMM">automatic market maker (AMM)</a> exchanges. The supported blockchains include popular
					Ethereum, Binance Smart Chain <span class="badge text-uppercase">Coming soon</span>, Polygon <span class="badge text-uppercase">Coming soon</span>
					and Avalanche <span class="badge text-uppercase">Coming soon</span>.
				</p>

				<h2>Data logistics</h2>

				<p>
					Datasets are distributed either in <a href="https://arrow.apache.org/">compressed Parquet</a> file format
					designed for data research. Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.
				</p>

				<p>
					Datasets are large. We expect you to download the dataset, cache the resulting file on a local disk and
					perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute
					candle data takes several gigabyte of memory.
				</p>

				<h2>Learn more</h2>

				<ul>
					<li>
						<a href="https://tradingstrategy.ai/docs/">Getting started</a>
					</li>
					<li>
						<a href="https://tradingstrategy.ai/docs/">Documentation</a>
					</li>
					<li>
						<a href="https://github.com/tradingstrategy-ai/client">Github</a>
					</li>
				</ul>

				<h2>Available datasets</h2>

				<div class="form-group">
					<label>Enter API key to enable download</label>
					<!-- <div class="d-flex flex-row justify-content-center"> -->
					<div>
						<div class="input-group"><input class="form-control"
														id="subscribeInputEmail" placeholder="TS-"
														type="email">
							<div class="input-group-prepend">
								<button type="submit" class="btn btn-primary rounded-right">Enter</button>
							</div>
						</div>
					</div>
				</div>

				<div class="table-responsive">
					<table class="table table-datasets">
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
										<a class=action-link href={row.documentation}>
											Documentation
										</a>

										<a class=action-link base-href={row.download} href="javascript:" disabled>
											Download
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
	  color: var(--link-color);
	  text-decoration: none;
	  font-weight: bold;
	  transition: 0.3s;
	}

	.card-body a:hover {
	  text-decoration: underline;
	  color: var(--link-color);
	}

	.table-datasets time {
		white-space: nowrap;
	}

	.action-link {
		font-size: 80%;
		text-transform: uppercase;
	}

	.action-link[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

</style>
