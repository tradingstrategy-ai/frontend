<!--
Historical vault TVL by chain page with a server-side aggregated weekly stacked line chart.

Benchmark the matching server-side aggregation with
`pnpm run benchmark:historical-tvl-chain`.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import { onMount } from 'svelte';
	import Alert from '$lib/components/Alert.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import type { HistoricalTvlByChainPayload } from '$lib/echarts/historical-tvl-chain';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import HistoricalTvlChainChart from './HistoricalTvlChainChart.svelte';

	let chartData = $state<HistoricalTvlByChainPayload | null>(null);
	let chartLoading = $state(true);
	let chartError = $state<string | null>(null);

	const title = 'Historical vault TVL by chain';
	const description = 'Explore how stablecoin vault TVL has evolved on different blockchains over time.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);

	onMount(() => {
		let cancelled = false;

		(async () => {
			try {
				chartLoading = true;
				chartError = null;

				const response = await fetch(resolve('/trading-view/vaults/historical-tvl-chain/chart-data'));
				if (!response.ok) throw new Error(`Failed to fetch historical chart data: ${response.status}`);

				const payload = (await response.json()) as HistoricalTvlByChainPayload;
				if (!cancelled) chartData = payload;
			} catch (loadError) {
				if (cancelled) return;
				chartError = loadError instanceof Error ? loadError.message : 'Failed to load chart data.';
			} finally {
				if (!cancelled) chartLoading = false;
			}
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: chartData?.series.length ?? 0
		}
	}}
/>

<main class="historical-tvl-chain-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner>
			{#snippet subtitle()}
				Explore how <a href={resolve('/glossary/stablecoin')}>stablecoin</a>
				<a href={resolve('/glossary/vault')}>vault</a>
				<a href={resolve('/glossary/total-value-locked-tvl')}>TVL</a> has evolved on different blockchains over time.
			{/snippet}
			{#snippet title()}
				<span>Historical vault TVL by chain</span>
				<DataBadge class="badge" status="beta">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="chart-section">
		<HistoricalTvlChainChart data={chartData} dataLoading={chartLoading} error={chartError} />
		<ScatterPlotSelector />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.historical-tvl-chain-page {
		:global(.badge) {
			font-size: 0.44em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}

		:global(.subtitle a) {
			text-decoration: underline;
		}
	}

	.mobile-notice {
		display: none;

		@media (max-width: 768px) {
			display: block;
			padding: 1rem var(--container-padding, 1rem);
		}
	}

	:global(.chart-section .standalone-historical-tvl-chain-shell .chart-surface) {
		@media (--viewport-sm-down) {
			margin-inline: calc(-1 * var(--space-md));
			width: calc(100% + (2 * var(--space-md)));
		}
	}
</style>
