<!--
Cumulative TVL/APY chart: vaults sorted by APY descending on X-axis,
cumulative TVL on Y-axis — showing how TVL accumulates across yield tiers.
-->
<script lang="ts">
	import { page } from '$app/state';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import CumulativeTvlApyChart from './CumulativeTvlApyChart.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let { savingsRate, treasuryRate } = $derived(data);

	const title = 'Total vault earnings';
	const description = 'Total stablecoin vault earnings across DeFi, shown against cumulative TVL.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
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
		mainEntity: { '@type': 'ItemList' }
	}}
/>

<main class="cumulative-tvl-apy-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner>
			{#snippet subtitle()}
				Total stablecoin vault earnings across DeFi, shown against cumulative TVL.
				<a href={resolve('/glossary/risk-free-rate')}>US Treasury note</a> and
				<a href={resolve('/glossary/fdic-national-rate')}>National Savings Rate</a> marked.
			{/snippet}
			{#snippet title()}
				<span>Total vault earnings</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="chart-section">
		<CumulativeTvlApyChart {savingsRate} {treasuryRate} />
		<ScatterPlotSelector />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.cumulative-tvl-apy-page {
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

	:global(.chart-section .standalone-cumulative-tvl-apy-shell .chart-surface) {
		@media (--viewport-sm-down) {
			margin-inline: calc(-1 * var(--space-md));
			width: calc(100% + (2 * var(--space-md)));
		}
	}
</style>
