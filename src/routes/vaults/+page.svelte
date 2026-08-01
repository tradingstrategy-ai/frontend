<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let { data } = $props();
	let topVaults = $derived(data.initialTopVaults);

	const title = 'Top DeFi stablecoin vaults';
	const description = 'The best DeFi vaults for all blockchains.';
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
			numberOfItems: data.totalVaultCount
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	totalVaultCount={data.totalVaultCount}
	loading={false}
	progressive={data.initialVaultListingHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	title="Top DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults across all blockchains"
	showFilters
/>
