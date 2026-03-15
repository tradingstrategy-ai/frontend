<!--
All vaults listing including problematic/blacklisted vaults
-->
<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache());

	$effect(() => {
		fetchAllVaultData()
			.then((data) => (topVaults = data))
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	const title = 'All DeFi stablecoin vaults';
	const description = 'All stablecoin vaults, including ones with stuck funds and oracle problems.';
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
			numberOfItems: topVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	{loading}
	includeBlacklisted
	title="All stablecoin vaults"
	subtitle="All stablecoin vaults, including ones with stuck funds and oracle problems"
	showFilters
	defaultTvlKey="10k"
/>
