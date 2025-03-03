<script lang="ts">
	import { backendUrl, backendInternalUrl } from '$lib/config';
	import { formatByteUnits, formatNumber } from '$lib/helpers/formatters';
	import {
		Alert,
		Button,
		ContentCard,
		ContentCardsSection,
		HeroBanner,
		Section,
		Spinner,
		TextInput,
		Timestamp
	} from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import IconBook from '~icons/local/book';

	export let data;

	let submitting = false;
	let validApiKey = '';
	let apiKeyError = '';

	function getDownloadUrl(originalUrl: string) {
		// NOTE: public API does not properly identify the request origin based on `X-Forwarded-Host`
		// header, so it returns an internal URL instead of cannonical (public) URL
		if (backendInternalUrl) {
			originalUrl = originalUrl.replace(backendInternalUrl, backendUrl);
		}
		const url = new URL(originalUrl);
		url.searchParams.set('api-key', validApiKey);
		return url.toString();
	}

	async function handleSubmit(event: SubmitEvent) {
		const url = `${backendUrl}/validate-api-key`;
		const key = (event.target as HTMLFormElement).apiKey.value.trim();

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
			apiKeyError = String(e);
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
		<HeroBanner title="Historical DEX trading data">
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
			<form id="form-api-key" on:submit|preventDefault={handleSubmit}>
				<label for="apiKey">Enter API key to enable download</label>

				<div class="form-group">
					<TextInput autocomplete="off" id="apiKey" placeholder="secret-token:tradingstrategy-" type="text" size="lg" />

					<Button submit label="Enter" size="sm" disabled={submitting} />

					{#if submitting}
						<Spinner />
					{/if}
				</div>
			</form>
		{/if}

		{#if apiKeyError}
			<Alert size="sm">{apiKeyError}</Alert>
		{/if}

		{#if validApiKey}
			<p>
				Using API key <strong>{validApiKey}</strong>
			</p>
		{/if}

		<div class="datasets">
			<table class="datatable sm">
				<thead>
					<tr class="col-headers">
						<th class="name">Name</th>
						<th>Tag</th>
						<th class="right">Entries</th>
						<th class="right">Size</th>
						<th>Format</th>
						<th>Last updated</th>
						<th class="links">Links</th>
					</tr>
				</thead>

				<tbody>
					{#each data.datasets as row}
						<tr>
							<td class="name">{row.name}</td>
							<td>{row.designation}</td>
							<td class="right">{formatNumber(row.entries, 1, 1, { notation: 'compact' })}</td>
							<td class="right">{formatByteUnits(row.size)}</td>
							<td>{row.format}</td>
							<td>
								<Timestamp date={row.last_updated_at} let:relative>
									{relative.replace(/^about /, '')}
								</Timestamp>
							</td>
							<td class="links">
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
		<ContentCard title="Data logistics">
			<IconBook slot="icon" />
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
		<ContentCard title="Learn more">
			<IconBook slot="icon" />
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

<style>
	.backtesting-page {
		display: grid;
		gap: var(--space-lg);

		h2 {
			font: var(--f-heading-lg-medium);
			margin-bottom: var(--space-lg);
		}

		:is(p, li) {
			margin-bottom: 1em;
		}

		form {
			display: grid;
			gap: var(--space-xs);
			margin-bottom: var(--space-lg);

			label {
				font: var(--f-ui-md-medium);
			}

			.form-group {
				display: flex;
				gap: var(--space-sl);
				align-items: center;
				--text-input-width: 100%;
				--text-input-max-width: 30rem;
			}
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

		.datasets {
			overflow-x: auto;
			overflow-y: hidden;

			:is(th, td) {
				padding-inline: 0.5em;
				&:first-child {
					padding-left: 1em;
				}
			}

			.name {
				white-space: nowrap;
			}

			.links {
				width: 10em;
			}
		}
	}
</style>
