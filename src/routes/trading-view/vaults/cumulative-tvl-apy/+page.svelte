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
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { topVaults, savingsRate } = $derived(data);

	const title = 'Cumulative TVL/APY';
	const description =
		'Line chart plotting DeFi vaults by APY with cumulative TVL on the Y-axis. Most capital sits in lower-yield vaults, while high-yield vaults hold less TVL.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<main class="cumulative-tvl-apy-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner
			subtitle="Each point is a vault plotted by its APY. The line shows cumulative TVL — most capital sits in lower-yield vaults on the left, while high-yield vaults on the right hold less TVL."
		>
			{#snippet title()}
				<span>Cumulative TVL / APY</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<CumulativeTvlApyChart vaults={topVaults.vaults} {savingsRate} />
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
	}

	.mobile-notice {
		display: none;

		@media (max-width: 768px) {
			display: block;
			padding: 1rem var(--container-padding, 1rem);
		}
	}
</style>
