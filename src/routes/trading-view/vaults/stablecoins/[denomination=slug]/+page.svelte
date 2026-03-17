<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { formatStablecoinDisplayName } from '$lib/stablecoin-metadata/helpers';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let { data } = $props();
	let { denominationSlug, denominationSymbol, denominationName, stablecoinMetadata } = $derived(data);

	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache());

	$effect(() => {
		fetchAllVaultData()
			.then((allData) => {
				topVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => v.denomination_slug === denominationSlug)
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	let title = $derived(`Top ${denominationName} vaults | Trading Strategy`);
	let description = $derived(
		stablecoinMetadata?.short_description ?? `Top ${denominationName} DeFi vaults ranked by performance.`
	);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived(stablecoinMetadata?.logos.light);
	let aboutName = $derived(formatStablecoinDisplayName(stablecoinMetadata?.name, stablecoinMetadata?.symbol));
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
		about: stablecoinMetadata
			? {
					'@type': 'FinancialProduct',
					name: aboutName ?? stablecoinMetadata.name,
					description: stablecoinMetadata.short_description,
					image: stablecoinMetadata.logos.light ?? undefined,
					url: stablecoinMetadata.links.homepage ?? undefined,
					category: stablecoinMetadata.category,
					sameAs: [stablecoinMetadata.links.coingecko, stablecoinMetadata.links.defillama].filter(Boolean)
				}
			: undefined,
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: topVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	{loading}
	{stablecoinMetadata}
	title="Top {denominationName} vaults"
	showFilters
	defaultTvlKey="10k"
/>
