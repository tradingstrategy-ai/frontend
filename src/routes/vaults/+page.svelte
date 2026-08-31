<!--
Top stablecoin vault listing page.
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { getVaultSortDescription } from '$lib/top-vaults/vault-sort-description';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();

	const title = 'Top stablecoin vaults';
	const description = 'Stablecoin vault rankings by yield, risk, and other performance criteria.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let rankingDescription = $derived(getVaultSortDescription(page.url.searchParams.get('sort')));
	let subtitle = $derived(
		`The best-performing stablecoin vaults. Ranked by ${rankingDescription}. Table headers and filters offer more criteria.`
	);
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
	topVaults={data.initialTopVaults}
	totalVaultCount={data.totalVaultCount}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	{title}
	{subtitle}
	showFilters
/>
