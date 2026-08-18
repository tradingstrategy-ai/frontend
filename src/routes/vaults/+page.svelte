<!--
Top stablecoin vault listing page.
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();
	let topVaults = $derived(data.initialTopVaults);

	const title = 'Top DeFi stablecoin vaults';
	const description = 'Vaults rankings with the highest yield and the lowest risk.';
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
	subtitle="The best-performing stablecoin vaults. Ranked by 1M returns. Use filters for other criteria."
	showFilters
/>
