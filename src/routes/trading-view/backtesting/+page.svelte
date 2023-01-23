<script lang="ts">
	import type { PageData } from './$types';
	import { backendUrl } from '$lib/config';
	import { formatDistanceToNow } from 'date-fns';
	import { formatKilos, formatSizeMegabytes } from '$lib/helpers/formatters';
	import Spinner from 'svelte-spinner';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button, TextInput } from '$lib/components';

	export let data: PageData;

	let submitting = false;
	let validApiKey = null;
	let apiKeyError = null;

	function getDownloadUrl(urlStr: string) {
		const url = new URL(urlStr);
		url.searchParams.set('api-key', validApiKey);
		return url.toString();
	}

	async function handleSubmit(event) {
		const url = `${backendUrl}/validate-api-key`;
		const key = event.target.apiKey.value.trim();

		apiKeyError = null;
		submitting = true;

		try {
			const resp = await fetch(url, {
				method: 'POST',
				body: new URLSearchParams({ key })
			});

			if (resp.status !== 200) {
				apiKeyError = `Server failure: ${resp.status} ${resp.statusText}`;
				return;
			}

			const respData = await resp.json();

			if (!respData.valid) {
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

<Breadcrumbs />

<main>
	<header class="ds-container">
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
	</header>

	<section class="ds-container">
		<h2>Available datasets</h2>

		{#if !validApiKey}
			<form id="form-api-key" class="form-group" on:submit|preventDefault={handleSubmit}>
				<label for="apiKey">Enter API key to enable download</label>

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
					{#each data.datasets as row}
						<tr>
							<td>{row.name}</td>
							<td>{row.designation}</td>
							<td>{formatKilos(row.entries)}</td>
							<td>{formatSizeMegabytes(row.size)}</td>
							<td>{row.format}</td>
							<td>
								{formatDistanceToNow(row.last_updated_at * 1000, { addSuffix: true })}
							</td>

							<td>
								<a class="action-link" href={row.documentation}>Documentation</a>

								{#if validApiKey}
									<a class="action-link" target="_blank" href={getDownloadUrl(row.download_link)}>Download</a>
								{:else}
									<span class="action-link">Download</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="ds-container ds-2-col">
		<div>
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
		</div>

		<div>
			<h2>Learn more</h2>

			<ul>
				<li>
					<a class="body-link" href="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html">
						Getting started with Trading Strategy Python client
					</a>
				</li>
				<li>
					<a class="body-link" href="https://tradingstrategy.ai/docs/">Technical documentation</a>
				</li>
				<li>
					<a class="body-link" href="https://github.com/tradingstrategy-ai/client">Github</a>
				</li>
			</ul>
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-lg);
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	h2 {
		font: var(--f-h3-medium);
	}

	p,
	li {
		font: var(--f-ui-body-roman);
		margin-top: 1em;
	}

	label {
		font: var(--f-ui-body-medium);
	}

	.table-datasets :global(time) {
		white-space: nowrap;
	}

	.action-link {
		text-transform: uppercase;
		font-size: 0.8em;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	a.action-link:hover {
		text-decoration: underline;
	}

	span.action-link {
		opacity: 0.5;
		cursor: not-allowed;
	}

	#form-group-api-key {
		display: flex;
		gap: var(--space-md);
		--text-input-width: 100%;
		--text-input-max-width: 30rem;
		--button-height: auto;
	}

	main :global .svelte-spinner {
		align-self: center;
	}
</style>
