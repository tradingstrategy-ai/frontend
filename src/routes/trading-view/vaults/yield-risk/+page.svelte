<!--
Scatter plot page showing vault TVL vs three-month annualised returns, coloured by risk level.
-->
<script lang="ts">
	import { page } from '$app/state';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import VaultScatterPlot from './VaultScatterPlot.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { topVaults } = $derived(data);

	const title = 'Vault yield vs risk';
	const description =
		'Scatter plot of DeFi vault TVL versus three-month annualised returns, grouped by risk level. Adjust the minimum TVL filter to focus on larger vaults.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<main class="yield-risk-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner
			subtitle="Explore vault TVL versus three-month annualised returns, coloured by risk level. Adjust the minimum TVL filter to focus on larger vaults."
		>
			{#snippet title()}
				<span>Vault yield / risk scatter plot</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<VaultScatterPlot vaults={topVaults.vaults} />
	</Section>
</main>

<style>
	.yield-risk-page {
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
