<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let { data } = $props();
	let { protocolSlug, protocolName, protocolMetadata } = $derived(data);

	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache());

	$effect(() => {
		fetchAllVaultData()
			.then((allData) => {
				topVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => v.protocol_slug === protocolSlug)
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	let title = $derived(`${protocolName} vault comparison`);
	let description = $derived(protocolMetadata?.short_description ?? `Top stablecoin vaults on ${protocolName}`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived(protocolMetadata?.logos.light);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title,
		description,
		images: logoUrl ? [{ url: logoUrl }] : [],
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: logoUrl ? 'summary_large_image' : 'summary',
		title,
		description,
		image: logoUrl ?? undefined
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		image: logoUrl ?? undefined,
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: topVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	{loading}
	{protocolMetadata}
	title="Top {protocolName} vaults"
	subtitle="Top stablecoin vaults on {protocolName}"
	showFilters
	defaultTvlKey="10k"
/>
