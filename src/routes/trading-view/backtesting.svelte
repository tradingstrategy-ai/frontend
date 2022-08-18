<script context="module">
	// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a
	export async function load({ url, session, fetch }) {
		const { backendUrl } = session.config;
		const apiUrl = `${backendUrl}/datasets`;

		// TODO: We should be able to remove this now with new Node.js adapter and FRONTEND_ORIGIN
		const res = await fetch(apiUrl, {
			// When we are doing server-side rendering, we are shortcutting the public Internet and directly hitting the internal API.
			// See hooks/index.ts for more information.
			// However, in this case, the backend does not know our domain name. For this particular API call,
			// The backend is using Pyramid request.route_url() function to generate download URLs.
			// This is different from hitting the API from the client side, because in that case these
			// fields would be correct, and also overwritten by the web browser / Cloudflare.
			headers: {
				'X-Forwarded-Host': 'tradingstrategy.ai',
				'X-Forwarded-Proto': 'https',
				Host: 'tradingstrategy.ai'
			}
		});

		const datasets = await res.json();

		if (res.ok) {
			return { props: { backendUrl, datasets } };
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script>
	import Spinner from 'svelte-spinner';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { formatTimeAgo } from '$lib/helpers/formatters';

	export let backendUrl;
	export let datasets;

	let submitting = false;
	let validApiKey = null;
	let apiKeyError = null;

	function formatNumber(n) {
		if (n <= 1000) {
			return (n / 1000).toLocaleString('en', {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			});
		} else {
			return (n / 1000).toLocaleString('en', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		}
	}

	function formatSize(n) {
		if (n <= 1024 * 1024) {
			return (n / (1024 * 1024)).toLocaleString('en', {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			});
		} else {
			return (n / (1024 * 1024)).toLocaleString('en', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		}
	}

	function formatDownloadLink(key, link) {
		// Cannot downlaod without API key
		if (!validApiKey) {
			return 'javascript:';
		}

		const url = new URL(link);
		url.searchParams.set('api-key', key);
		return url.toString();
	}

	async function handleSubmit(event) {
		const url = `${backendUrl}/validate-api-key`;
		let key = event.target.apiKey.value;

		// Avoid whitespace issues
		key = key.trim();

		apiKeyError = null;
		submitting = true;

		try {
			// https://stackoverflow.com/a/53189376/315168
			//console.log("Posting to", url);
			const res = await fetch(url, {
				method: 'POST',
				body: new URLSearchParams({ key })
			});

			if (res.status != 200) {
				apiKeyError = `Server failure: ${res.status} ${res.statusText}`;
				return;
			}

			const data = await res.json();

			// console.log("Got validation response", data);

			if (!data.valid) {
				apiKeyError = 'The API key is not valid';
				return;
			}

			validApiKey = key;
		} catch (e) {
			apiKeyError = e.toString();
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Historical DEX trading data</title>
	<meta name="description" content="Download price, OHLCV and liquidity backtesting data" />
</svelte:head>

<div class="container container-main">
	<Breadcrumbs />
	<section>
		<h1>Historical DEX trading data</h1>

		<p>
			The following datasets are available for historical DEX trading data.
			<a class="body-link" href="/trading-view/api">Sign up for a free API key to download the data.</a>
		</p>

		<p>
			Read the documentation
			<a class="body-link" href="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html"
				>how to get started with Trading Strategy Python library for algorithmic trading</a
			>.
		</p>

		<h2>Available datasets</h2>

		{#if !validApiKey}
			<form id="form-api-key" class="form-group" on:submit|preventDefault={handleSubmit}>
				<label for="apiKey">Enter API key to enable download</label>

				<!-- <div class="d-flex flex-row justify-content-center"> -->
				<div id="form-group-api-key">
					<TextInput id="apiKey" placeholder="secret-token:tradingstrategy-" type="text" size="lg" />

					<Button submit label="Enter" disabled={submitting} />

					{#if submitting}
						<Spinner />
					{/if}
				</div>
			</form>
		{/if}

		{#if apiKeyError}
			<div class="alert alert-danger shadow-soft" role="alert">
				<span class="alert-inner--text">{apiKeyError}</span>
			</div>
		{/if}

		{#if validApiKey}
			<p>
				Using API key <strong>{validApiKey}</strong>
			</p>
		{/if}

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
					{#each datasets as row}
						<tr>
							<td>{row.name}</td>
							<td>{row.designation}</td>
							<td>{formatNumber(row.entries)}</td>
							<td>{formatSize(row.size)}</td>
							<td>{row.format}</td>
							<td>
								{formatTimeAgo(row.last_updated_at)}
							</td>

							<td>
								<a class="action-link" href={row.documentation}>Documentation</a>

								<a
									class="action-link"
									rel="external"
									target={validApiKey ? `_blank` : undefined}
									href={formatDownloadLink(validApiKey, row.download_link)}
									disabled={validApiKey ? undefined : 'disabled'}
								>
									Download
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<h2>Data logistics</h2>

		<p>
			Datasets are distributed in <a href="https://parquet.apache.org/">Parquet</a> file format designed for data research.
			Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.
		</p>

		<p>
			Datasets are large. Datasets are compressed using Parquet built-in Snappy compression and may be considerably
			larger when expanded to RAM. We expect you to download the dataset, cache the resulting file on a local disk and
			perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute candle
			data takes several gigabyte of memory.
		</p>

		<h2>Learn more</h2>

		<ul>
			<li>
				<a rel="external" href="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html"
					>Getting started with Trading Strategy Python client</a
				>
			</li>
			<li>
				<a rel="external" href="https://tradingstrategy.ai/docs/">Technical documentation</a>
			</li>
			<li>
				<a href="https://github.com/tradingstrategy-ai/client">Github</a>
			</li>
		</ul>
	</section>
</div>

<style>
	.table-datasets :global(time) {
		white-space: nowrap;
	}

	.action-link {
		text-transform: uppercase;
		font-size: 0.8em;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	.action-link:hover {
		text-decoration: underline;
	}

	.action-link[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	#form-group-api-key {
		display: flex;
		gap: 1rem;
		--text-input-width: 100%;
		--text-input-max-width: 30rem;
		--button-height: auto;
	}

	:global .svelte-spinner {
		align-self: center;
	}
</style>
