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
	import { fetchAllVaultData, hasVaultCache } from './client-cache';
	import { getCore3PolForVault } from './helpers';
	import { riskRatingProviders, type RiskRatingProvider } from './risk-rating-providers';
	import type { TopVaults, VaultInfo } from './schemas';
	import TopVaultsPage from './TopVaultsPage.svelte';

	interface Props {
		provider: RiskRatingProvider;
	}

	let { provider }: Props = $props();
	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache(page.data.generatedAt));
	let providerDetails = $derived(riskRatingProviders[provider]);
	let metadataDescription = $derived(`Compare DeFi stablecoin vaults by ${providerDetails.name} risk rating.`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let ratedTopVaults = $derived.by(() => {
		const vaultData = topVaults;
		if (!vaultData) return undefined;

		return {
			...vaultData,
			vaults: vaultData.vaults.filter((vault) => hasProviderRating(vault, vaultData, provider))
		};
	});

	function hasProviderRating(vault: VaultInfo, vaultData: TopVaults, ratingProvider: RiskRatingProvider): boolean {
		if (ratingProvider === 'xerberus') return vault.xerberus?.score != null;
		const core3 = getCore3PolForVault(vault, vaultData.core3_protocols);
		return core3?.score != null && core3.rating != null;
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
	includeBlacklisted
	tvlTriggerLabel="All TVL"
	tvlTooltip="This list includes all vaults with a rating from this provider, regardless of TVL."
	title={providerDetails.pageTitle}
	headingLogo={{ src: providerDetails.logoUrl, alt: providerDetails.logoAlt }}
	ratingProvider={provider}
	defaultSort="provider_risk_rating"
	defaultDirection={providerDetails.defaultDirection}
>
	{#snippet subtitle()}
		{#if provider === 'core3'}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={providerDetails.website} target="_blank" rel="noreferrer">CORE3</a> publishes Probability of Loss ratings
			for DeFi protocols. Lower scores indicate lower estimated risk.
			<a href={resolve('/vaults/core3-risk')}>See also CORE3 charts</a>.
		{:else}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={providerDetails.website} target="_blank" rel="noreferrer">Xerberus</a> provides independent risk ratings for
			DeFi vaults and protocols. Higher scores indicate stronger ratings.
		{/if}
	{/snippet}
</TopVaultsPage>

<style>
	:global(.hero-banner .subtitle a) {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>
