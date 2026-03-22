<!--
ECharts heatmap page showing current vault TVL by stablecoin and chain.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { JsonLd, MetaTags } from 'svelte-meta-tags';
	import Alert from '$lib/components/Alert.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import type { StablecoinChainHeatmapPayload } from '$lib/echarts/stablecoin-chain-heatmap';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import StablecoinChainHeatmapChart from './StablecoinChainHeatmapChart.svelte';

	let chartData = $state<StablecoinChainHeatmapPayload | null>(null);
	let chartLoading = $state(true);
	let chartError = $state<string | null>(null);

	const title = 'Stablecoin / Chain TVL heatmap';
	const description =
		'Compare the top 10 stablecoins and blockchains by current vault TVL, showing TVL-weighted average one month returns.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);

	$effect(() => {
		let cancelled = false;

		(async () => {
			try {
				chartLoading = true;
				chartError = null;
				const response = await fetch(resolve('/trading-view/vaults/stablecoin-chain-heatmap/chart-data'));
				if (!response.ok) throw new Error(`Failed to fetch heatmap data: ${response.status}`);

				const payload = (await response.json()) as StablecoinChainHeatmapPayload;
				if (!cancelled) chartData = payload;
			} catch (loadError) {
				if (cancelled) return;
				chartError = loadError instanceof Error ? loadError.message : 'Failed to load heatmap data.';
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
			numberOfItems: chartData?.cells.length ?? 0
		}
	}}
/>

<main class="stablecoin-chain-heatmap-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner>
			{#snippet subtitle()}
				Compare the top 10 <a href={resolve('/glossary/stablecoin')}>stablecoins</a> and blockchains by current
				<a href={resolve('/glossary/vault')}>vault</a> <a href={resolve('/glossary/total-value-locked-tvl')}>TVL</a>.
				Cell colours show TVL-weighted annualised 1M return.
			{/snippet}
			{#snippet title()}
				<span>Stablecoin / Chain TVL heatmap</span>
				<DataBadge class="badge" status="beta">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="chart-section">
		<StablecoinChainHeatmapChart data={chartData} dataLoading={chartLoading} error={chartError} />
		<ScatterPlotSelector />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.stablecoin-chain-heatmap-page {
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

	:global(.chart-section .standalone-stablecoin-chain-heatmap-shell .chart-surface) {
		@media (--viewport-sm-down) {
			margin-inline: calc(-1 * var(--space-md));
			width: calc(100% + (2 * var(--space-md)));
		}
	}
</style>
