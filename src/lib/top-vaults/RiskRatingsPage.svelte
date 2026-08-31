<!--
@component
Displays every vault with a score from one third-party risk-rating provider.

The list defaults to the provider's safest-first score direction and exposes
the score in a column beside each vault name.

@example

```svelte
  <RiskRatingsPage
    provider="core3"
    initialTopVaults={data.initialTopVaults}
    initialHasMore={data.initialHasMore}
    listingSummary={data.listingSummary}
  />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { riskRatingProviders, type RiskRatingProvider } from './risk-rating-providers';
	import { type RiskRatingStatistics, type RiskRatingTvlBand } from './risk-rating-statistics';
	import type { VaultListingSummary } from './listing/types';
	import type { TopVaults } from './schemas';
	import TopVaultsPage from './TopVaultsPage.svelte';
	import MarketSharePieChart from '../../routes/vaults/MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../../routes/vaults/MarketShareWidgetBox.svelte';
	import type { MarketSharePieSlice } from '../../routes/vaults/market-share-pie';

	interface Props {
		provider: RiskRatingProvider;
		initialTopVaults: TopVaults;
		initialHasMore: boolean;
		listingSummary: VaultListingSummary;
		initialRatingStatistics?: RiskRatingStatistics;
		initialRiskRatingTvlBands?: RiskRatingTvlBand[];
	}

	let {
		provider,
		initialTopVaults,
		initialHasMore,
		listingSummary,
		initialRatingStatistics,
		initialRiskRatingTvlBands
	}: Props = $props();
	let providerDetails = $derived(riskRatingProviders[provider]);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let ratingStatistics = $derived(initialRatingStatistics);
	let riskRatingTvlBands = $derived(initialRiskRatingTvlBands ?? []);
	let riskRatingGroupLabel = $derived(provider === 'core3' ? 'CORE3 rating' : 'Risk bracket');
	let riskRatingGroupLabelPlural = $derived(provider === 'core3' ? 'CORE3 ratings' : 'risk brackets');
	let riskChartTitle = $derived(
		`${formatDollar(ratingStatistics?.totalTvl ?? 0, 1, 1)} TVL by ${providerDetails.name} risk rating`
	);
	let ratingSummary = $derived.by(() => {
		const { totalTvl, vaultCount, blockchainCount, averageMonthlyReturn } = ratingStatistics ?? {
			totalTvl: 0,
			vaultCount: 0,
			blockchainCount: 0,
			averageMonthlyReturn: null
		};
		const vaultLabel = vaultCount === 1 ? 'vault' : 'vaults';
		const blockchainLabel = blockchainCount === 1 ? 'blockchain' : 'blockchains';

		return `${providerDetails.name} rates ${vaultCount} ${vaultLabel} on ${blockchainCount} ${blockchainLabel}, covering ${formatDollar(totalTvl, 0)} TVL. The current TVL-weighted average monthly return is ${formatPercent(averageMonthlyReturn, 1)}.`;
	});
	let metadataDescription = $derived(
		`${providerDetails.name} risk ratings cover ${formatDollar(ratingStatistics?.totalTvl ?? 0, 0)} TVL across ${
			ratingStatistics?.vaultCount ?? 0
		} ${(ratingStatistics?.vaultCount ?? 0) === 1 ? 'vault' : 'vaults'}`
	);

	const core3ToneColourValues = {
		excellent: 'var(--c-success)',
		good: 'color-mix(in srgb, var(--c-success), var(--c-warning))',
		fair: 'var(--c-warning)',
		poor: 'var(--c-error)'
	};
	const xerberusRiskColourValues = [
		'var(--c-error)',
		'hsl(18 92% 52%)',
		'var(--c-warning)',
		'hsl(82 70% 43%)',
		'hsl(174 70% 40%)',
		'var(--c-success)'
	];

	function resolveCssColour(colourValue: string): string {
		const probe = document.createElement('span');
		probe.style.color = colourValue;
		document.body.append(probe);
		const resolvedColour = getComputedStyle(probe).color;
		probe.remove();
		return resolvedColour;
	}

	function getCore3SliceColour(slice: MarketSharePieSlice): string | undefined {
		const colourValue = core3ToneColourValues[slice.tone as keyof typeof core3ToneColourValues];
		if (!colourValue) return undefined;
		return resolveCssColour(colourValue);
	}

	function getXerberusSliceColour(slice: MarketSharePieSlice): string | undefined {
		const bandIndex = Number(slice.slug?.replace('risk-', '')) - 1;
		const colourValue = xerberusRiskColourValues[bandIndex];
		return colourValue ? resolveCssColour(colourValue) : undefined;
	}

	function getRiskSliceColour(slice: MarketSharePieSlice): string | undefined {
		return provider === 'core3' ? getCore3SliceColour(slice) : getXerberusSliceColour(slice);
	}

	function formatRiskChartTvl(slice: MarketSharePieSlice): string {
		return formatDollar(slice.tvl, 1, 1);
	}
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
			numberOfItems: ratingStatistics?.vaultCount ?? 0
		}
	}}
/>

<TopVaultsPage
	topVaults={initialTopVaults}
	tvlTriggerLabel="All TVL"
	tvlTooltip="This list includes all vaults with a rating from this provider, regardless of TVL."
	title={providerDetails.pageTitle}
	headingLogo={{ src: providerDetails.logoUrl, alt: providerDetails.logoAlt }}
	ratingProvider={provider}
	defaultSort="provider_risk_rating"
	defaultDirection={providerDetails.defaultDirection}
	defaultHideUnknown={0}
	showUnknownFilter={false}
	{initialHasMore}
	listingKey={provider === 'core3' ? 'core3-ratings' : 'xerberus-ratings'}
	{listingSummary}
>
	{#snippet heroAside()}
		<MarketShareWidgetBox title={riskChartTitle}>
			<MarketSharePieChart
				items={riskRatingTvlBands}
				groupLabel={riskRatingGroupLabel}
				groupLabelPlural={riskRatingGroupLabelPlural}
				otherThreshold={0}
				labelValueFormatter={formatRiskChartTvl}
				getSliceColour={getRiskSliceColour}
				centreImageUrl={providerDetails.logoUrl}
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
		<p>{ratingSummary}</p>
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
