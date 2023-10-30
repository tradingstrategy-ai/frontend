<script lang="ts">
	import { backendUrl } from '$lib/config';
	import { formatKilos, formatSizeMegabytes } from '$lib/helpers/formatters';
	import { Alert, Button, ContentCard, HeroBanner, Section, TextInput, Timestamp } from '$lib/components';
	import Spinner from 'svelte-spinner';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ContentCardsSection from '$lib/components/ContentCardsSection.svelte';

	export let data;

	let submitting = false;
	let validApiKey = '';
	let apiKeyError = '';

	function getDownloadUrl(urlStr: string) {
		const url = new URL(urlStr);
		url.searchParams.set('api-key', validApiKey);
		return url.toString();
	}

	async function handleSubmit(event) {
		const url = `${backendUrl}/validate-api-key`;
		const key = event.target.apiKey.value.trim();

		apiKeyError = '';
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

<main class="backtesting-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="Historical DEX trading data">
			<svelte:fragment slot="subtitle">
				<p>
					The following datasets are available for historical DEX trading data.
					<a class="body-link" href="/trading-view/api">Sign up for a free API key to download the data.</a>
				</p>
				<p>
					Read the documentation
					<a
						class="body-link"
						href="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html"
						rel="external"
					>
						how to get started with Trading Strategy Python library for algorithmic trading
					</a>.
				</p>
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section>
		<h2>Available datasets</h2>

		{#if !validApiKey}
			<form id="form-api-key" class="form-group" on:submit|preventDefault={handleSubmit}>
				<TextInput
					autocomplete="off"
					id="apiKey"
					label="Enter API key to enable download"
					placeholder="secret-token:tradingstrategy-"
					type="text"
					size="lg"
				/>

				<Button submit label="Enter" size="sm" disabled={submitting} />

				{#if submitting}
					<Spinner />
				{/if}
			</form>
		{/if}

		{#if apiKeyError}
			<Alert>{apiKeyError}</Alert>
		{/if}

		{#if validApiKey}
			<p>
				Using API key <strong>{validApiKey}</strong>
			</p>
		{/if}

		<div class="table-responsive">
			<table class="table-datasets">
				<thead>
					<tr>
						<th>Name</th>
						<th>Tag</th>
						<th class="right">Entry count (k)</th>
						<th class="right">Size (MBytes)</th>
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
							<td class="right">{formatKilos(row.entries)}</td>
							<td class="right">{formatSizeMegabytes(row.size)}</td>
							<td>{row.format}</td>
							<td><Timestamp date={row.last_updated_at} relative /></td>
							<td>
								<a class="action-link" href={row.documentation} rel="external">Documentation</a>
								{#if validApiKey}
									<a class="action-link" target="_blank" rel="noreferrer" href={getDownloadUrl(row.download_link)}>
										Download
									</a>
								{:else}
									<span class="action-link">Download</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Section>

	<ContentCardsSection>
		<ContentCard title="Data logistics" icon="book">
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
		</ContentCard>
		<ContentCard title="Learn more" icon="book">
			<ul>
				<li>
					<a
						class="body-link"
						href="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html"
						rel="external"
					>
						Getting started with Trading Strategy Python client
					</a>
				</li>
				<li>
					<a class="body-link" href="https://tradingstrategy.ai/docs/" rel="external">Technical documentation</a>
				</li>
				<li>
					<a class="body-link" href="https://github.com/tradingstrategy-ai/client">Github</a>
				</li>
			</ul>
		</ContentCard>
	</ContentCardsSection>
</main>

<style lang="postcss">
	.backtesting-page {
		display: grid;
		gap: var(--space-lg);

		h2 {
			font: var(--f-heading-lg-medium);
			margin-bottom: var(--space-xl);
		}

		:is(p, li) {
			margin-bottom: 1em;
		}

		form {
			margin-bottom: var(--space-lg);
			display: flex;
			align-items: flex-end;
			gap: var(--space-md);
			--text-input-width: 100%;
			--text-input-max-width: 30rem;
			--button-height: auto;
		}

		:global .svelte-spinner {
			align-self: center;
		}

		.action-link {
			display: inline-block;
			text-transform: uppercase;
			font-size: 0.8em;
			font-weight: 500;
			letter-spacing: 0.02em;

			&:hover {
				text-decoration: underline;
			}

			&:is(span) {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}

	.table-datasets td a {
		position: relative;

		&:not(.button)::before {
			bottom: calc(-1 * var(--space-sm));
			border-radius: var(--radius-sm);
			content: '';
			left: calc(-1 * var(--space-sm));
			position: absolute;
			right: calc(-1 * var(--space-sm));
			top: calc(-1 * var(--space-sm));
			transition: background var(--time-sm) ease-out;
		}

		&:not(.button):hover::before {
			background: hsla(var(--hsl-box), var(--a-box-c));
		}
	}
</style>
