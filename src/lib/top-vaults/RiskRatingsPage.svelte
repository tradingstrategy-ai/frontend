<!--
@component
Displays every vault with a score from one third-party risk-rating provider.

The list defaults to the provider's safest-first score direction and exposes
the score in a column beside each vault name.

@example

```svelte
  <RiskRatingsPage provider="core3" />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { fetchAllVaultData, hasVaultCache } from './client-cache';
	import { riskRatingProviders, type RiskRatingProvider } from './risk-rating-providers';
	import {
		getRiskRatedVaults,
		getRiskRatingStatistics,
		getRiskRatingTvlBands,
		type RiskRatingStatistics,
		type RiskRatingTvlBand
	} from './risk-rating-statistics';
	import type { TopVaults } from './schemas';
	import TopVaultsPage from './TopVaultsPage.svelte';
	import MarketSharePieChart from '../../routes/vaults/MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../../routes/vaults/MarketShareWidgetBox.svelte';
	import type { MarketSharePieSlice } from '../../routes/vaults/market-share-pie';

	interface Props {
		provider: RiskRatingProvider;
		initialRatingStatistics?: RiskRatingStatistics;
		initialRiskRatingTvlBands?: RiskRatingTvlBand[];
	}

	let { provider, initialRatingStatistics, initialRiskRatingTvlBands }: Props = $props();
	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache(page.data.generatedAt));
	let providerDetails = $derived(riskRatingProviders[provider]);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let ratedTopVaults = $derived.by(() => {
		const vaultData = topVaults;
		if (!vaultData) return undefined;

		return {
			...vaultData,
			vaults: getRiskRatedVaults(vaultData, provider)
		};
	});
	let ratingStatistics = $derived.by(() => {
		return ratedTopVaults ? getRiskRatingStatistics(ratedTopVaults.vaults) : initialRatingStatistics;
	});
	let riskRatingTvlBands = $derived(
		topVaults ? getRiskRatingTvlBands(topVaults, provider) : (initialRiskRatingTvlBands ?? [])
	);
	let riskRatingGroupLabel = $derived(provider === 'core3' ? 'CORE3 rating' : 'Risk bracket');
	let riskRatingGroupLabelPlural = $derived(provider === 'core3' ? 'CORE3 ratings' : 'risk brackets');
	let ratingSummary = $derived.by(() => {
		const { totalTvl, vaultCount, blockchainCount, averageMonthlyReturn } = ratingStatistics ?? {
			totalTvl: 0,
			vaultCount: 0,
			blockchainCount: 0,
			averageMonthlyReturn: null
		};
		const vaultLabel = vaultCount === 1 ? 'vault' : 'vaults';
		const blockchainLabel = blockchainCount === 1 ? 'blockchain' : 'blockchains';

		return `${providerDetails.name} risk rates ${formatDollar(totalTvl, 0)} TVL in ${vaultCount} ${vaultLabel} on ${blockchainCount} ${blockchainLabel}. The current TVL-weighted average monthly return is ${formatPercent(averageMonthlyReturn, 1)}.`;
	});
	let metadataDescription = $derived(
		`${providerDetails.name} risk rates ${formatDollar(ratingStatistics?.totalTvl ?? 0, 0)} TVL in ${
			ratingStatistics?.vaultCount ?? 0
		} ${(ratingStatistics?.vaultCount ?? 0) === 1 ? 'vault' : 'vaults'}`
	);

	const core3ToneColourValues = {
		excellent: 'var(--c-success)',
		good: 'color-mix(in srgb, var(--c-success), var(--c-warning))',
		fair: 'var(--c-warning)',
		poor: 'var(--c-error)'
	};

	function getCore3SliceColour(slice: MarketSharePieSlice): string | undefined {
		const colourValue = core3ToneColourValues[slice.tone as keyof typeof core3ToneColourValues];
		if (!colourValue) return undefined;

		const probe = document.createElement('span');
		probe.style.color = colourValue;
		document.body.append(probe);
		const resolvedColour = getComputedStyle(probe).color;
		probe.remove();
		return resolvedColour;
	}

	$effect(() => {
		fetchAllVaultData(page.data.generatedAt)
			.then((data) => (topVaults = data))
			.catch((error) => console.error(`Failed to load ${providerDetails.name} ratings:`, error))
			.finally(() => (loading = false));
	});
</script>

<MetaTags
	title={providerDetails.pageTitle}
	description={metadataDescription}
	canonical={pageUrl}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title: providerDetails.pageTitle,
		description: metadataDescription,
		images: [{ url: providerDetails.logoUrl, alt: providerDetails.logoAlt }],
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: 'summary',
		title: providerDetails.pageTitle,
		description: metadataDescription,
		image: providerDetails.logoUrl
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: providerDetails.pageTitle,
		description: metadataDescription,
		url: pageUrl,
		image: providerDetails.logoUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: ratedTopVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	topVaults={ratedTopVaults}
	{loading}
	tvlTriggerLabel="All TVL"
	tvlTooltip="This list includes all vaults with a rating from this provider, regardless of TVL."
	title={providerDetails.pageTitle}
	headingLogo={{ src: providerDetails.logoUrl, alt: providerDetails.logoAlt }}
	ratingProvider={provider}
	defaultSort="provider_risk_rating"
	defaultDirection={providerDetails.defaultDirection}
>
	{#snippet heroAside()}
		<MarketShareWidgetBox title="Risk by TVL">
			<MarketSharePieChart
				items={riskRatingTvlBands}
				groupLabel={riskRatingGroupLabel}
				groupLabelPlural={riskRatingGroupLabelPlural}
				otherThreshold={0}
				getSliceColour={provider === 'core3' ? getCore3SliceColour : undefined}
				testId={`${provider}-risk-by-tvl-pie-chart`}
			/>
		</MarketShareWidgetBox>
	{/snippet}

	{#snippet subtitle()}
		{#if provider === 'core3'}
			<p>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={providerDetails.website} target="_blank" rel="noreferrer">CORE3</a> publishes Probability of Loss
				ratings for DeFi protocols. Lower scores indicate lower estimated risk.
				<a href={resolve('/vaults/core3-risk')}>See also CORE3 charts</a>.
			</p>
		{:else}
			<p>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={providerDetails.website} target="_blank" rel="noreferrer">Xerberus</a> provides independent risk ratings
				for DeFi vaults and protocols. Higher scores indicate stronger ratings.
			</p>
		{/if}
		{#if ratedTopVaults}
			<p>{ratingSummary}</p>
		{/if}
	{/snippet}
</TopVaultsPage>

<style>
	:global(.hero-banner .subtitle p) {
		margin: 0;
	}

	:global(.hero-banner .subtitle p + p) {
		margin-top: var(--space-sm);
	}

	:global(.hero-banner .subtitle a) {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>
