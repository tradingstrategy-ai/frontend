<!--
Vault listing for a single curator — all vaults managed by the curator,
with an "about" panel and a TVL/return mini chart.
-->
<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';

	let { data } = $props();
	let { curatorSlug, curatorName, curator } = $derived(data);

	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache());

	$effect(() => {
		fetchAllVaultData()
			.then((allData) => {
				topVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => v.curator_slug === curatorSlug)
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	let title = $derived(`Top ${curatorName} vaults`);
	let description = $derived(`Stablecoin vaults curated by ${curatorName}, ranked by performance.`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived(curator.logos.generic ? new URL(curator.logos.generic, page.url.origin).href : undefined);
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
	curatorMetadata={curator}
	title="Top {curatorName} vaults"
	subtitle="Stablecoin vaults curated by {curatorName}"
	showFilters
	defaultTvlKey="10k"
	defaultSort="tvl"
>
	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="All {curatorName} vaults"
			dataUrl="/trading-view/vaults/curators/{curatorSlug}/chart-data"
			compareLabel="Compare all curators"
			compareHref="/trading-view/vaults/curators"
		/>
	{/snippet}
</TopVaultsPage>
