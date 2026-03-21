<!--
Historical vault TVL by vault protocol page with a server-side aggregated weekly stacked line chart.
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
	import type { HistoricalTvlByProtocolPayload } from '$lib/echarts/historical-tvl';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import HistoricalTvlProtocolChart from './HistoricalTvlProtocolChart.svelte';

	let chartData = $state<HistoricalTvlByProtocolPayload | null>(null);
	let chartLoading = $state(true);
	let chartError = $state<string | null>(null);

	const title = 'Historical vault TVL by vault protocol';
	const description = 'Explore how stablecoin vault TVL has evolved across different vault protocols over time.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);

	onMount(() => {
		let cancelled = false;

		(async () => {
			try {
				chartLoading = true;
				chartError = null;

				const response = await fetch(resolve('/trading-view/vaults/historical-tvl-protocol/chart-data'));
				if (!response.ok) throw new Error(`Failed to fetch historical chart data: ${response.status}`);

				const payload = (await response.json()) as HistoricalTvlByProtocolPayload;
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

<main class="historical-tvl-protocol-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner>
			{#snippet subtitle()}
				Explore how <a href={resolve('/glossary/stablecoin')}>stablecoin</a>
				<a href={resolve('/glossary/vault')}>vault</a>
				<a href={resolve('/glossary/total-value-locked-tvl')}>TVL</a> has evolved across different
				<a href={resolve('/glossary/protocol')}>vault protocols</a> over time.
			{/snippet}
			{#snippet title()}
				<span>Historical vault TVL by vault protocol</span>
				<DataBadge class="badge" status="beta">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="chart-section">
		<HistoricalTvlProtocolChart data={chartData} dataLoading={chartLoading} error={chartError} />
		<ScatterPlotSelector />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.historical-tvl-protocol-page {
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

	:global(.chart-section .standalone-historical-tvl-protocol-shell .chart-surface) {
		@media (--viewport-sm-down) {
			margin-inline: calc(-1 * var(--space-md));
			width: calc(100% + (2 * var(--space-md)));
		}
	}
</style>
