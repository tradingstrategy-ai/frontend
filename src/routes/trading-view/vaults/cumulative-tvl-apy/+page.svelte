<!--
Cumulative TVL/APY chart: vaults sorted by APY descending on X-axis,
cumulative TVL on Y-axis — showing how TVL accumulates across yield tiers.
-->
<script lang="ts">
	import { page } from '$app/state';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import CumulativeTvlApyChart from './CumulativeTvlApyChart.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import { resolve } from '$app/paths';

	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';

	let { data } = $props();
	let { savingsRate, treasuryRate } = $derived(data);

	let vaults = $state<VaultInfo[]>([]);
	let vaultsLoading = $state(!hasVaultCache());

	$effect(() => {
		fetchAllVaultData()
			.then((allData) => (vaults = allData.vaults))
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (vaultsLoading = false));
	});

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
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: vaults.length
		}
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
				<DataBadge class="badge" status="beta">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<CumulativeTvlApyChart {vaults} {savingsRate} {treasuryRate} dataLoading={vaultsLoading} />
		<ScatterPlotSelector />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.cumulative-tvl-apy-page {
		:global(.badge) {
			font-size: 0.5em;
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
</style>
