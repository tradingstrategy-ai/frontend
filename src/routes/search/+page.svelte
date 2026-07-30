<!--
Search vaults and vault-related data about curators, protocols and stablecoins.
-->
<script lang="ts">
	import { Button, PageHeader } from '$lib/components';
	import {
		formatVaultAddressPrefix,
		searchEntityColours,
		searchEntityLabels,
		type SearchResult
	} from '$lib/search/entities';
	import type { VaultGroup } from '$lib/top-vaults/schemas';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';

	interface SearchPageData {
		query: string;
		results: SearchResult[];
		total: number;
		error: string | null;
	}

	let { data }: { data: SearchPageData } = $props();
	let query = $state('');
	let resultById = $derived(new Map(data.results.map((result) => [result.id, result])));
	let tableRows: VaultGroup[] = $derived(
		data.results.map((result) => ({
			slug: result.id,
			name: result.name,
			fullName: labelForType(result.entityType),
			vault_count: 0,
			avg_apy: result.averageApy1m,
			tvl: result.latestTvl ?? Number.NaN
		}))
	);

	$effect(() => {
		query = data.query;
	});

	function labelForType(type: SearchResult['entityType']) {
		return searchEntityLabels[type];
	}

	function getResultHref(id: string) {
		return resultById.get(id)?.href;
	}

	function getResultLogo(id: string) {
		return resultById.get(id)?.logoUrl ?? undefined;
	}

	function getResultAddress(id: string) {
		return formatVaultAddressPrefix(resultById.get(id)?.address ?? null) ?? undefined;
	}

	function getResultTypeColour(id: string) {
		const entityType = resultById.get(id)?.entityType;
		return entityType ? searchEntityColours[entityType] : undefined;
	}

	function getResultSparklineVault(id: string) {
		const result = resultById.get(id);
		return result?.vaultId ? { id: result.vaultId, name: result.name } : undefined;
	}

	function isResultBlacklisted(id: string) {
		return resultById.get(id)?.entityType === 'blacklisted-vault';
	}

	function getResultTvlSortValue(row: VaultGroup) {
		const result = resultById.get(row.slug);
		return [result?.entityType === 'blacklisted-vault' ? 0 : 1, result?.latestTvl ?? Number.NEGATIVE_INFINITY];
	}
</script>

<svelte:head>
	<title>Search vaults</title>
	<meta name="description" content="Search vaults and vault-related data about curators, protocols and stablecoins." />
	{#if data.query}<meta name="robots" content="noindex,follow" />{/if}
	<link rel="canonical" href="/search" />
</svelte:head>

<main>
	<PageHeader
		title="Search vaults"
		subtitle="Search vaults and vault-related data about curators, protocols and stablecoins."
	/>

	<section class="ds-container search-page">
		<form action="/search" role="search" class="search-form">
			<label for="search-page-input">Search</label>
			<input
				id="search-page-input"
				bind:value={query}
				name="q"
				type="search"
				placeholder="Search by name, symbol, address, chain or curator"
				autocomplete="off"
				autocapitalize="none"
				spellcheck="false"
			/>
			<Button submit label="Search" />
		</form>

		{#if data.error}
			<div class="message error" role="alert">
				<p>{data.error}</p>
				<a href={`/search?q=${encodeURIComponent(data.query)}`}>Try again</a>
			</div>
		{:else if !data.query}
			<div class="message">Enter a name, symbol, address, chain or curator to search the vault index.</div>
		{:else if !data.total}
			<div class="message">No results found for “{data.query}”. Try another name or symbol.</div>
		{:else}
			<p class="result-count">
				{#if data.total > data.results.length}
					Showing {data.results.length} of {data.total} results for “{data.query}”
				{:else}
					{data.total} result{data.total === 1 ? '' : 's'} for “{data.query}”
				{/if}
			</p>

			<VaultGroupTable
				class="search-results-table"
				groupLabel="Name"
				fullNameLabel="Entity type"
				averageApyLabel="APY 1M"
				tvlLabel="Latest TVL"
				ctaLabel="View"
				includeFullName
				includeVaultCount={false}
				includeSparkline
				rows={tableRows}
				getLogoHref={getResultLogo}
				getNameDetail={(row) => getResultAddress(row.slug)}
				getNameStrikethrough={(row) => isResultBlacklisted(row.slug)}
				getFullNameMarkerColour={(row) => getResultTypeColour(row.slug)}
				getSparklineVault={(row) => getResultSparklineVault(row.slug)}
				getTvlSortValue={getResultTvlSortValue}
				getHref={getResultHref}
				sort="tvl"
				direction="desc"
			/>
		{/if}
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-lg);
	}
	.search-page {
		display: grid;
		gap: var(--space-lg);
		padding-bottom: var(--space-4xl);
	}
	.search-form {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-sm);
		align-items: end;
	}
	.search-form label {
		grid-column: 1 / -1;
		font: var(--f-ui-sm-medium);
	}
	.search-form input {
		box-sizing: border-box;
		min-width: 0;
		height: 3rem;
		padding: 0 var(--space-md);
		border: 1px solid var(--c-input-border);
		border-radius: var(--radius-md);
		background: var(--c-input-background);
		color: var(--c-text);
		font: var(--f-ui-lg-medium);
	}
	.search-form input:focus-visible,
	.search-form :global(.button):focus-visible {
		outline: 2px solid var(--c-input-border-focus);
		outline-offset: 2px;
	}
	.message {
		padding: var(--space-lg);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
	}
	.message.error {
		border-color: var(--c-negative, #b43b3b);
		color: var(--c-text);
	}
	.message p {
		margin-top: 0;
	}
	.result-count {
		margin: 0;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
	}
	@media (--viewport-md-up) {
		:global(table.search-results-table td.name .entity-symbol) {
			gap: var(--space-md);
			padding-inline: var(--space-xs);
		}
	}

	/* The desktop table remains useful on tablets, but its metric headings need to wrap rather than ellipsise. */
	@media (width > 768px) and (width <= 1024px) {
		:global(table.search-results-table thead tr.col-headers th) {
			white-space: normal;
			overflow: visible;
			text-overflow: clip;
		}
	}

	@media (--viewport-sm-down) {
		.search-form {
			grid-template-columns: 1fr;
		}
		.search-form :global(.button) {
			width: 100%;
		}
	}
</style>
