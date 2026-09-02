<!--
Stablecoin vault listing filtered to negative returns.
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();

	const title = 'DeFi stablecoin vaults with negative returns';
	const description = 'Vaults with negative returns.';
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
	topVaults={data.initialTopVaults}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	totalVaultCount={data.totalVaultCount}
	{title}
	subtitle="Vaults with negative returns"
	showFilters
	defaultTvlKey="10k"
	defaultMonthlyReturnKey="neg"
	defaultSort="1m-ann"
	defaultDirection="asc"
/>
