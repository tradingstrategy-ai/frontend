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
	import { formatDollar } from '$lib/helpers/formatters';

	let { data } = $props();
	let { curatorSlug, curatorName, curator, vaultCount, tvl } = $derived(data);

	let topVaults = $state<TopVaults>();
	let totalVaultCount = $state<number>();
	let loading = $state(!hasVaultCache());

	$effect(() => {
		fetchAllVaultData()
			.then((allData) => {
				totalVaultCount = allData.vaults.length;
				topVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => v.curator_slug === curatorSlug)
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	/** Google truncates search snippets around this length; keep the meta description within it */
	const META_DESCRIPTION_MAX_LENGTH = 160;

	/** Ensure a plain-text fragment reads as a full sentence when concatenated */
	function asSentence(text: string) {
		const trimmed = text.trim();
		return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
	}

	/** Clip text at a word boundary (with an ellipsis) so it fits within maxLength */
	function clipAtWord(text: string, maxLength: number) {
		if (text.length <= maxLength) return text;
		const clipped = text.slice(0, maxLength - 1);
		const lastSpace = clipped.lastIndexOf(' ');
		return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength - 1).replace(/[,;:.]$/, '')}…`;
	}

	let title = $derived(`Top ${curatorName} stablecoin vaults | Trading Strategy`);
	let fullDescription = $derived.by(() => {
		const stats =
			vaultCount > 0 ? ` ${vaultCount} ${vaultCount === 1 ? 'vault' : 'vaults'} with ${formatDollar(tvl, 0)} TVL.` : '';
		const about = curator.short_description ? ` ${asSentence(curator.short_description)}` : '';
		return `Stablecoin vaults curated by ${curatorName}, ranked by returns and TVL.${stats}${about}`;
	});
	// search-snippet meta description: same content clipped to fit; social cards
	// and JSON-LD carry the full curator blurb
	let metaDescription = $derived(clipAtWord(fullDescription, META_DESCRIPTION_MAX_LENGTH));
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived(curator.logos.generic ? new URL(curator.logos.generic, page.url.origin).href : undefined);
	let socialProfileUrls = $derived([curator.twitter, curator.linkedin].filter((url) => url != null));
</script>

<MetaTags
	{title}
	description={metaDescription}
	canonical={pageUrl}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title,
		description: fullDescription,
		images: logoUrl ? [{ url: logoUrl, alt: `${curatorName} logo` }] : [],
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: logoUrl ? 'summary_large_image' : 'summary',
		title,
		description: fullDescription,
		image: logoUrl ?? undefined
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description: fullDescription,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		image: logoUrl ?? undefined,
		about: {
			'@type': 'Organization',
			name: curatorName,
			url: curator.website ?? undefined,
			logo: logoUrl ?? undefined,
			sameAs: socialProfileUrls.length > 0 ? socialProfileUrls : undefined
		},
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: vaultCount
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	{totalVaultCount}
	{loading}
	curatorMetadata={curator}
	title="Top {curatorName} stablecoin vaults"
	showFilters
	defaultTvlKey="10k"
	defaultSort="tvl"
>
	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="{curatorName}: TVL and returns across all vaults"
			dataUrl="/trading-view/vaults/curators/{curatorSlug}/chart-data"
			compareLabel="Compare all curators"
			compareHref="/trading-view/vaults/curators"
		/>
	{/snippet}
</TopVaultsPage>
