<!--
Whitelisted vault listing for permissioned deposits.
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();
	let topVaults = $derived(data.initialTopVaults);

	const title = 'Whitelisted DeFi stablecoin vaults';
	const description =
		'This ranking contains only vaults that are not open to public and have some sort of permissioned deposits.';
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
			numberOfItems: data.listingSummary.matchingCount
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	loading={false}
	progressive={data.initialVaultListingHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	totalVaultCount={data.totalVaultCount}
	includeBlacklisted
	includeBlacklistedInStats
	title="Whitelisted stablecoin vaults"
	subtitle={description}
	showFilters
	defaultTvlKey="any"
	defaultRiskIndex={0}
	defaultHideUnknown={0}
	defaultSort="tvl"
	defaultDirection="desc"
/>
