<!--
Scatter plot page showing vault current TVL versus historical peak TVL, coloured by blockchain.
-->
<script lang="ts">
	import { page } from '$app/state';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import TvlScatterPlot from './TvlScatterPlot.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	const title = 'Vault current/peak TVL';
	const description =
		'Scatter plot of vault current TVL versus historical peak TVL, coloured by blockchain. Vaults on the diagonal are at their all-time high. Adjust the minimum TVL filter to focus on larger vaults.';
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

<main class="current-peak-tvl-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner
			subtitle="Explore current TVL versus historical peak TVL, coloured by blockchain. Vaults on the diagonal are at their all-time high. Adjust the minimum TVL filter to focus on larger vaults."
		>
			{#snippet title()}
				<span>Vault current/peak TVL scatter plot</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<TvlScatterPlot />
		<ScatterPlotSelector />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.mobile-notice {
		display: none;

		@media (max-width: 768px) {
			display: block;
			padding: 1rem var(--container-padding, 1rem);
		}
	}
</style>
