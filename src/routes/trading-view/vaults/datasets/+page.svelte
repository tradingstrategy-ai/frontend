<!--
Vault datasets download page
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { backendUrl } from '$lib/config';
	import { formatByteUnits } from '$lib/helpers/formatters';
	import { Alert, Button, HeroBanner, Section, Spinner, TextInput, Timestamp } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';

	let { data }: { data: PageData } = $props();

	let submitting = $state(false);
	let validApiKey = $state('');
	let apiKeyError = $state('');

	const documentationUrl = 'https://tradingstrategy.ai/docs/overview/defi-vault-data.html';
	const apiKeyPlaceholder = 'secret-token:tradingstrategy-...';

	function getDownloadUrl(originalUrl: string) {
		const url = new URL(originalUrl);
		url.searchParams.set('api-key', validApiKey);
		return url.toString();
	}

	function getCurlUrl(originalUrl: string) {
		const separator = originalUrl.includes('?') ? '&' : '?';
		return `${originalUrl}${separator}api-key=$TRADING_STRATEGY_API_KEY`;
	}

	function escapeShellDoubleQuoted(value: string) {
		return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('$', '\\$').replaceAll('`', '\\`');
	}

	function getCurlCommand(dataset: PageData['datasets'][number]) {
		const apiKey = escapeShellDoubleQuoted(validApiKey || apiKeyPlaceholder);

		return [
			`export TRADING_STRATEGY_API_KEY="${apiKey}"`,
			`curl -L "${getCurlUrl(dataset.downloadUrl)}" --output ${dataset.filename}`
		].join('\n');
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const apiKeyField = form.elements.namedItem('apiKey');
		const key = apiKeyField instanceof HTMLInputElement ? apiKeyField.value.trim() : '';

		apiKeyError = '';
		submitting = true;

		try {
			const response = await fetch(`${backendUrl}/validate-api-key`, {
				method: 'POST',
				body: new URLSearchParams({ key })
			});

			if (response.status !== 200) {
				apiKeyError = `Server failure: ${response.status} ${response.statusText}`;
				return;
			}

			const payload = await response.json();

			if (!payload.valid) {
				apiKeyError = 'The API key is not valid';
				return;
			}

			validApiKey = key;
		} catch (err) {
			apiKeyError = String(err);
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Vault data</title>
	<meta name="description" content="Download vault metadata and historical vault price datasets" />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Vaults', datasets: 'Vault datasets' }} />

<main class="vault-datasets-page">
	<Section tag="header">
		<HeroBanner title="Vault datasets">
			{#snippet subtitle()}
				<p>
					<a class="body-link" href={resolve('/pricing')}>Sign up for the professional API key</a> to download the vault data.
				</p>
				<p>
					Read
					<a class="body-link" href={documentationUrl} rel="external"> data format documention </a>.
				</p>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<h2>Dataset catalogue</h2>

		{#if !validApiKey}
			<form id="form-api-key" onsubmit={handleSubmit}>
				<label for="apiKey">Enter API key to enable download</label>

				<div class="form-group">
					<TextInput
						autocomplete="off"
						id="apiKey"
						name="apiKey"
						placeholder={apiKeyPlaceholder}
						type="text"
						size="lg"
					/>

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
						<th class="description">Description</th>
						<th>Format</th>
						<th class="right">Size</th>
						<th>Last updated</th>
						<th class="links">Links</th>
					</tr>
				</thead>

				<tbody>
					{#each data.datasets as row (row.id)}
						<tr>
							<td class="name">
								<strong>{row.name}</strong>
								<p class="filename">{row.filename}</p>
							</td>
							<td class="description">{row.description}</td>
							<td>{row.format}</td>
							<td class="right">{row.size ? formatByteUnits(row.size) : 'Unavailable'}</td>
							<td>
								{#if row.lastUpdatedAt}
									<Timestamp date={row.lastUpdatedAt} relative={{ strict: true }} />
								{:else}
									Unavailable
								{/if}
							</td>
							<td class="links">
								<a class="action-link" href={row.documentation} rel="external">Documentation</a>
								{#if validApiKey}
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a class="action-link" target="_blank" rel="noreferrer" href={getDownloadUrl(row.downloadUrl)}>
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

	<Section>
		<h2>Download with curl</h2>

		<p>Programmatically access the data. Requires a valid API key you can enter above.</p>

		<div class="curl-grid">
			{#each data.datasets as row (row.id)}
				<article class="curl-card">
					<h3>{row.name}</h3>
					<p>{row.instructions}</p>
					<pre><code>{getCurlCommand(row)}</code></pre>
				</article>
			{/each}
		</div>
	</Section>
</main>

<style>
	.vault-datasets-page {
		display: grid;
		gap: var(--space-lg);

		h2 {
			font: var(--f-heading-lg-medium);
			margin-bottom: var(--space-lg);
		}

		h3 {
			font: var(--f-heading-sm-medium);
			margin-bottom: var(--space-sm);
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
				min-width: 24rem;

				strong {
					display: block;
					margin-bottom: var(--space-2xs);
				}
			}

			.description {
				min-width: 24rem;
			}

			.filename {
				margin: 0;
				font: var(--f-mono-sm-regular);
				color: var(--c-text-light);
				white-space: nowrap;
			}

			.links {
				width: 10em;
			}
		}

		.curl-grid {
			display: grid;
			gap: var(--space-md);

			@media (--viewport-md-up) {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
		}

		.curl-card {
			padding: var(--space-md);
			border: 1px solid var(--c-border);
			border-radius: var(--radius-md);
			background: var(--c-box-1);
		}

		pre {
			margin: 0;
			padding: var(--space-md);
			border-radius: var(--radius-sm);
			background: var(--c-box-2);
			overflow-x: auto;
		}

		code {
			font: var(--f-mono-sm-regular);
			white-space: pre;
		}
	}
</style>
