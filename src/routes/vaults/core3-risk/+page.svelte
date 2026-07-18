<!--
CORE3 stablecoin vault risk chart page.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { formatUsd } from '$lib/echarts/cumulative-tvl-apy';
	import type { Core3RiskPayload } from '$lib/echarts/core3-risk';
	import Alert from '$lib/components/Alert.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { CORE3_METHODOLOGY_URL } from '$lib/top-vaults/helpers';
	import { JsonLd, MetaTags } from 'svelte-meta-tags';
	import { onMount } from 'svelte';
	import Core3RiskCharts from './Core3RiskCharts.svelte';

	let chartData = $state<Core3RiskPayload | null>(null);
	let chartLoading = $state(true);
	let chartError = $state<string | null>(null);

	const title = 'CORE3 risk charts for stablecoin vaults';
	const description =
		'Compare stablecoin vault returns and TVL by CORE3 protocol risk score, including the amount of stablecoin vault TVL not yet covered by CORE3.';
	const chartDataVersion = 'core3-risk-v1';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let uncoveredTvlText = $derived(
		chartData ? formatUsd(chartData.meta.uncoveredStablecoinTvl) : 'the uncategorised share'
	);
	let uncoveredShareText = $derived(
		chartData ? `${(chartData.meta.uncoveredStablecoinTvlShare * 100).toFixed(1)}%` : 'a live share'
	);

	onMount(() => {
		let cancelled = false;

		(async () => {
			try {
				chartLoading = true;
				chartError = null;

				const response = await fetch(resolve('/vaults/core3-risk/chart-data') + `?v=${chartDataVersion}`);
				if (!response.ok) throw new Error(`Failed to fetch CORE3 chart data: ${response.status}`);

				const payload = (await response.json()) as Core3RiskPayload;
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
			numberOfItems: chartData?.scatterPoints.length ?? 0
		}
	}}
/>

<main class="core3-risk-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">These charts are best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner>
			{#snippet subtitle()}
				CORE3 is a third-party protocol risk rating that estimates
				<a href={CORE3_METHODOLOGY_URL} target="_blank" rel="noreferrer">Probability of Loss</a> for DeFi protocols.
				This view covers <a href={resolve('/glossary/stablecoin')}>stablecoin</a>
				<a href={resolve('/glossary/vault')}>vaults</a> only. CORE3 does not yet cover {uncoveredTvlText}
				({uncoveredShareText}) of eligible stablecoin vault
				<a href={resolve('/glossary/total-value-locked-tvl')}>TVL</a> shown here.
			{/snippet}
			{#snippet title()}
				<span>CORE3 risk charts for stablecoin vaults</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="chart-section">
		<Core3RiskCharts data={chartData} dataLoading={chartLoading} error={chartError} />
		<ScatterPlotSelector />
		<p class="methodology">
			CORE3 scores are protocol-level Probability of Loss estimates. Lower scores are better.
			<a href={CORE3_METHODOLOGY_URL} target="_blank" rel="noreferrer">Read the CORE3 methodology.</a>
		</p>
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.core3-risk-page {
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

	.methodology {
		margin-top: 1rem;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		text-align: center;

		a {
			color: var(--c-text-light);
			text-decoration: underline;
		}
	}
</style>
