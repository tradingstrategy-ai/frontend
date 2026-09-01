<!--
Compare selected vault equity curves and fixed market benchmarks on one indexed chart.
-->
<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { tick, untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { JsonLd } from 'svelte-meta-tags';
	import Alert from '$lib/components/Alert.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { removeOnError } from '$lib/actions/image';
	import { formatPercentProfit, notFilledMarker } from '$lib/helpers/formatters';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import Search from '$lib/search/components/Search.svelte';
	import type { SearchResult } from '$lib/search/entities';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import VaultEquityComparisonChart from '$lib/top-vaults/equity-comparison/VaultEquityComparisonChart.svelte';
	import { assignVaultComparisonColours, benchmarkComparisonColours } from '$lib/top-vaults/equity-comparison/colours';
	import {
		MAX_SELECTED_VAULTS,
		canonicaliseComparisonBenchmarks,
		parseEquityComparisonState,
		writeEquityComparisonState
	} from '$lib/top-vaults/equity-comparison/state';
	import type {
		ComparisonBenchmark,
		ComparisonTimeSpan,
		VaultComparisonChartResponse
	} from '$lib/top-vaults/equity-comparison/types';
	import IconCancel from '~icons/local/cancel';

	let { data } = $props();
	let selectedVaults = $derived(data.selectedVaults);
	let selectedVaultIds = $derived(selectedVaults.map(({ id }) => id));
	let selectionLimitReached = $derived(selectedVaultIds.length >= MAX_SELECTED_VAULTS);
	let comparisonState = $derived(parseEquityComparisonState(page.url.searchParams));
	let chartData = $state<VaultComparisonChartResponse>();
	let chartLoading = $state(true);
	let chartError = $state<string | null>(null);
	let retryVersion = $state(0);
	let chartRequestVersion = 0;
	let comparisonPending = $state(false);
	let pendingVaultId = $state<string | null>(null);
	let colours = $state<ReadonlyMap<string, string>>(new Map());
	let selectedTimeSpan = $state<ComparisonTimeSpan>('3M');
	let selectedPeriodMetricsByVaultId = $derived(
		new Map(
			(chartData?.vaultSeries ?? []).map((series) => [series.id, series.periodMetrics?.[selectedTimeSpan]] as const)
		)
	);
	let chartRequestKey = $derived(JSON.stringify([selectedVaultIds, comparisonState.benchmarks]));
	let previousChartRequestKey: string | undefined;
	let handledRetryVersion = 0;

	const pageTitle = 'Compare vaults';
	const metaTitle = 'Compare and find best DeFi vault yield';
	const description = 'Analyse more than 5000 vaults';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	const benchmarkOptions: { key: ComparisonBenchmark; label: string }[] = [
		{ key: 'treasury', label: 'T-Bill' },
		{ key: 'eth', label: 'ETH' },
		{ key: 'btc', label: 'BTC' }
	];

	$effect(() => {
		const ids = selectedVaultIds;
		untrack(() => {
			colours = assignVaultComparisonColours(ids, colours);
		});
	});

	$effect(() => {
		const rawBenchmarks = page.url.searchParams.getAll('benchmark');
		const canonicalBenchmarks = canonicaliseComparisonBenchmarks(rawBenchmarks);
		if (
			rawBenchmarks.length === canonicalBenchmarks.length &&
			rawBenchmarks.every((value, index) => value === canonicalBenchmarks[index])
		)
			return;

		const canonicalSearchParams = new SvelteURLSearchParams(page.url.searchParams);
		canonicalSearchParams.delete('benchmark');
		for (const benchmark of canonicalBenchmarks) canonicalSearchParams.append('benchmark', benchmark);
		const canonicalSearch = canonicalSearchParams.size ? `?${canonicalSearchParams}` : '';
		replaceState(resolve(`/vaults/compare${canonicalSearch}` as '/vaults/compare'), page.state);
	});

	$effect(() => {
		const requestKey = chartRequestKey;
		const currentRetryVersion = retryVersion;
		const forceReload = currentRetryVersion !== handledRetryVersion;
		if (requestKey === previousChartRequestKey && !forceReload) return;

		previousChartRequestKey = requestKey;
		handledRetryVersion = currentRetryVersion;
		return untrack(() => loadChartData(selectedVaultIds, comparisonState.benchmarks, forceReload));
	});

	/** Load the compact server-prepared payload for the current comparison. */
	function loadChartData(vaultIds: string[], benchmarks: ComparisonBenchmark[], forceReload: boolean): () => void {
		const requestVersion = ++chartRequestVersion;
		const controller = new AbortController();
		chartError = null;

		if (!vaultIds.length) {
			chartData = undefined;
			chartLoading = false;
			return () => controller.abort();
		}

		chartLoading = true;
		const params = new SvelteURLSearchParams();
		for (const vaultId of vaultIds) params.append('vault', vaultId);
		for (const benchmark of benchmarks) params.append('benchmark', benchmark);

		void fetch(`/vaults/compare/chart-data?${params}`, {
			signal: controller.signal,
			cache: forceReload ? 'reload' : 'default'
		})
			.then(async (response) => {
				if (!response.ok) throw new Error(`Chart data request failed with status ${response.status}`);
				return (await response.json()) as VaultComparisonChartResponse;
			})
			.then((response) => {
				if (requestVersion !== chartRequestVersion) return;
				chartData = response;
			})
			.catch((error) => {
				if ((error as Error).name === 'AbortError' || requestVersion !== chartRequestVersion) return;
				console.error('Failed to load vault comparison chart data', error);
				chartError = 'Equity history could not be loaded. Your vault selection has been preserved.';
			})
			.finally(() => {
				if (requestVersion === chartRequestVersion) chartLoading = false;
			});

		return () => controller.abort();
	}

	async function updateComparison(vaultIds: string[], benchmarks: ComparisonBenchmark[]): Promise<void> {
		const searchParams = writeEquityComparisonState(page.url.searchParams, { vaultIds, benchmarks });
		const search = searchParams.size ? `?${searchParams}` : '';
		comparisonPending = true;
		try {
			await goto(resolve(`/vaults/compare${search}` as '/vaults/compare'), {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
		} finally {
			comparisonPending = false;
		}
	}

	async function addVault(vaultId: string): Promise<void> {
		pendingVaultId = vaultId;
		try {
			await updateComparison([...selectedVaultIds, vaultId], comparisonState.benchmarks);
		} finally {
			pendingVaultId = null;
		}
	}

	async function removeVault(vaultId: string, index: number): Promise<void> {
		await updateComparison(
			selectedVaultIds.filter((id) => id !== vaultId),
			comparisonState.benchmarks
		);
		await tick();
		const buttons = document.querySelectorAll<HTMLButtonElement>('.selected-vaults button.remove');
		buttons[Math.min(index, buttons.length - 1)]?.focus();
	}

	function toggleBenchmark(benchmark: ComparisonBenchmark, checked: boolean): void {
		const benchmarks = checked
			? [...comparisonState.benchmarks, benchmark]
			: comparisonState.benchmarks.filter((value) => value !== benchmark);
		void updateComparison(selectedVaultIds, benchmarks);
	}
</script>

{#snippet addVaultButton(result: SearchResult, onAction: () => void)}
	<button
		type="button"
		disabled={!result.vaultId ||
			selectedVaultIds.includes(result.vaultId) ||
			selectionLimitReached ||
			comparisonPending}
		aria-label={`Add ${result.name} to comparison`}
		aria-busy={pendingVaultId === result.vaultId}
		onclick={() => {
			if (!result.vaultId) return;
			onAction();
			void addVault(result.vaultId);
		}}
	>
		{#if pendingVaultId === result.vaultId}
			<Spinner size="18" /><span>Adding…</span>
		{:else}
			{result.vaultId && selectedVaultIds.includes(result.vaultId) ? 'Added' : 'Add'}
		{/if}
	</button>
{/snippet}

<MetaTags
	title={metaTitle}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title: metaTitle, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title: metaTitle, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: pageTitle,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: { '@type': 'ItemList', numberOfItems: selectedVaults.length }
	}}
/>

<main class="vault-compare-page ds-3">
	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner
			subtitle="Compare the historical performance of vaults with each other and US Treasury, ETH, and BTC benchmarks. The index may include or exclude fees depending on the vault type; check the vault pages for fee details."
		>
			{#snippet title()}<span>{pageTitle}</span>{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="comparison-section">
		<div class="comparison-controls">
			<div class="vault-search">
				<Search
					scope="vaults"
					format="page"
					label="Add vaults"
					inputLabel="Search vaults to compare"
					placeholder="Search by vault name, address, protocol or chain"
					showAllResults={false}
					minimumVaultTvlUsd={1_000}
					disabled={selectionLimitReached || comparisonPending}
					addButton={addVaultButton}
				/>
				{#if selectionLimitReached}
					<p class="search-status">You can compare up to {MAX_SELECTED_VAULTS} vaults.</p>
				{/if}
			</div>

			<fieldset class="benchmarks">
				<legend>Benchmarks</legend>
				<div class="benchmark-options">
					{#each benchmarkOptions as benchmark (benchmark.key)}
						<label style:--benchmark-colour={benchmarkComparisonColours[benchmark.key]}>
							<input
								type="checkbox"
								checked={comparisonState.benchmarks.includes(benchmark.key)}
								disabled={!selectedVaults.length || comparisonPending}
								onchange={(event) => toggleBenchmark(benchmark.key, event.currentTarget.checked)}
							/>
							<span class="benchmark-swatch" aria-hidden="true"></span>
							<span>{benchmark.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>
		</div>

		{#if selectedVaults.length}
			<section class="selected-vault-selection" aria-labelledby="selected-vaults-heading">
				<h2 id="selected-vaults-heading" class="comparison-subheading">Selected vaults</h2>
				<ul class="selected-vaults" aria-labelledby="selected-vaults-heading">
					{#each selectedVaults as vault, index (vault.id)}
						{@const periodMetrics = selectedPeriodMetricsByVaultId.get(vault.id)}
						<li class:blacklisted={vault.entityType === 'blacklisted-vault'}>
							<span class="vault-colour" style:--vault-colour={colours.get(vault.id)} aria-hidden="true"></span>
							<span class="vault-logo">
								{#if vault.logoUrl}<img src={vault.logoUrl} alt="" use:removeOnError />{/if}
							</span>
							<span class="vault-copy">
								<a href={resolve(vault.href as `/vaults/${string}`)}>{vault.name}</a>
								<small>{vault.protocolName} · {vault.chainName}</small>
								{#if chartData?.missingVaultIds.includes(vault.id)}<em>Equity history unavailable</em>{/if}
							</span>
							<span class="vault-period-metrics" aria-live="polite">
								<strong>{formatPercentProfit(periodMetrics?.cagr)} CAGR</strong>
								<small>Since {periodMetrics?.since ?? notFilledMarker}</small>
							</span>
							<button
								class="remove"
								type="button"
								disabled={comparisonPending}
								aria-label={`Remove ${vault.name} from comparison`}
								onclick={() => removeVault(vault.id, index)}
							>
								<IconCancel aria-hidden="true" />
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if chartError}
			<Alert status="warning" size="sm">
				{chartError}
				<button class="retry" type="button" onclick={() => retryVersion++}>Retry</button>
			</Alert>
		{/if}

		{#if !selectedVaults.length}
			<div class="empty-state">
				<h2>Add vaults to compare</h2>
				<p>Search above to place up to eight vault equity curves on the same indexed chart.</p>
			</div>
		{:else if chartData?.vaultSeries.length || chartLoading}
			<VaultEquityComparisonChart
				vaults={selectedVaults}
				data={chartData}
				enabledBenchmarks={comparisonState.benchmarks}
				{colours}
				loading={chartLoading || comparisonPending}
				{selectedTimeSpan}
				onTimeSpanChange={(timeSpan) => (selectedTimeSpan = timeSpan)}
			/>
		{:else if !chartError}
			<div class="empty-state">
				<h2>No equity history available</h2>
				<p>Try another vault or keep this selection and retry later.</p>
			</div>
		{/if}

		{#if selectedVaults.length}
			<section class="selected-comparison-table" aria-labelledby="selected-comparison-heading">
				<h2 id="selected-comparison-heading">Selected vault comparison</h2>
				<TopVaultsTable
					topVaults={data.selectedTopVaults}
					includeBlacklisted
					defaultHideUnknown={0}
					tvlTriggerLabel="Selected vaults"
					tvlTooltip="This table contains only the vaults selected for the equity comparison."
					showStablecoinOnlyMeta={false}
					preserveSearchParams={['vault', 'benchmark']}
				/>
			</section>
		{/if}

		<ScatterPlotSelector />
	</Section>

	<Section><TopVaultsOptIn /></Section>
</main>

<style>
	.vault-compare-page {
		--control-panel-padding: var(--space-lg);
	}
	.comparison-controls {
		display: grid;
		grid-template-columns: minmax(20rem, 1fr) auto;
		gap: var(--space-lg);
		align-items: end;
		padding: var(--control-panel-padding);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		background: var(--c-box-1);
	}
	.vault-search {
		min-width: 0;
	}
	.comparison-subheading,
	.benchmarks legend {
		margin: 0;
		color: var(--c-text-light);
		font: var(--f-heading-xs-medium);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.selected-vault-selection {
		margin: var(--space-lg) 0;
	}
	.selected-vault-selection .comparison-subheading {
		margin-bottom: var(--space-sm);
	}
	.search-status {
		margin: var(--space-xs) 0 0;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
	}
	.selected-comparison-table {
		margin-top: var(--space-xl);

		h2 {
			margin-bottom: var(--space-sm);
			font: var(--f-heading-md-medium);
		}
	}
	.benchmarks {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.benchmarks legend {
		margin-bottom: var(--space-xs);
	}
	.benchmark-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}
	.benchmark-options label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: 3rem;
		padding-inline: var(--space-sm);
		border: 1px solid var(--c-input-border);
		border-radius: var(--radius-sm);
		font: var(--f-ui-sm-medium);
		cursor: pointer;
	}
	.benchmark-options label:has(input:disabled) {
		opacity: 0.55;
		cursor: default;
	}
	.benchmark-swatch,
	.vault-colour {
		display: block;
		width: 1.25rem;
		height: 0;
		border-top: 3px solid var(--benchmark-colour);
		border-radius: 999px;
	}
	.selected-vaults {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
		gap: var(--space-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.selected-vaults li {
		display: grid;
		grid-template-columns: auto 2rem minmax(0, 1fr) auto auto;
		gap: var(--space-sm);
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		padding-inline-start: 0;
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-sm);
		background: var(--c-box-1);
	}
	.selected-vaults li.blacklisted .vault-copy a {
		text-decoration: line-through;
	}
	.vault-colour {
		border-color: var(--vault-colour);
	}
	.vault-logo {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		overflow: hidden;
		border-radius: 50%;
		background: var(--c-box-2);
	}
	.vault-logo img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.vault-copy {
		display: grid;
		min-width: 0;
		gap: var(--space-xxs);
	}
	.vault-copy :is(a, small, em) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.vault-copy a {
		color: var(--c-text);
		font: var(--f-ui-md-medium);
	}
	.vault-copy small {
		color: var(--c-text-extra-light);
	}
	.vault-copy em {
		color: var(--c-warning);
		font: var(--f-ui-xs-medium);
		font-style: normal;
	}
	.vault-period-metrics {
		display: grid;
		gap: var(--space-xxs);
		text-align: right;
		white-space: nowrap;
	}
	.vault-period-metrics strong {
		font: var(--f-ui-sm-medium);
	}
	.vault-period-metrics small {
		color: var(--c-text-extra-light);
	}
	.remove {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--c-text-extra-light);
		cursor: pointer;
	}
	.remove:is(:hover, :focus-visible) {
		background: var(--c-box-2);
		color: var(--c-text);
	}
	.retry {
		margin-left: var(--space-sm);
		border: 0;
		background: transparent;
		color: var(--c-link);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
	.empty-state {
		display: grid;
		min-height: 25rem;
		place-content: center;
		gap: var(--space-sm);
		margin-top: var(--space-lg);
		border: 1px dashed var(--c-box-3);
		border-radius: var(--radius-md);
		color: var(--c-text-extra-light);
		text-align: center;
	}
	.empty-state h2 {
		color: var(--c-text);
		font: var(--f-heading-md-medium);
	}
	@media (--viewport-md-down) {
		.comparison-controls {
			grid-template-columns: 1fr;
		}
	}
	@media (--viewport-sm-down) {
		.vault-compare-page {
			--control-panel-padding: var(--space-md);
		}
		.comparison-subheading,
		.benchmarks legend {
			font-size: 0.875rem;
		}
		.benchmark-options label {
			flex: 1 1 auto;
			justify-content: center;
		}
		.empty-state {
			min-height: 18rem;
			padding-inline: var(--space-md);
		}
	}
	@media (--viewport-xs) {
		.selected-vaults li {
			grid-template-columns: auto 2rem minmax(0, 1fr) auto;
		}
		.vault-period-metrics {
			grid-column: 3;
			grid-row: 2;
			text-align: left;
		}
		.remove {
			grid-column: 4;
			grid-row: 1 / span 2;
		}
	}
</style>
