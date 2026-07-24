<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import {
		formatStablecoinDisplayName,
		getStablecoinCoingeckoLink,
		getStablecoinLogoUrl
	} from '$lib/stablecoin-metadata/helpers';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';
	import VaultGroupDescription from '../../VaultGroupDescription.svelte';

	let { data } = $props();
	let {
		denominationSlug,
		denominationSymbol,
		denominationName,
		shortDescription,
		stablecoinMetadata,
		initialTopVaults
	} = $derived(data);

	let fetchedTopVaults = $state<TopVaults>();
	let fetchSettled = $state(false);
	let topVaults = $derived(initialTopVaults ?? fetchedTopVaults);
	let loading = $derived(!initialTopVaults && !fetchSettled && !hasVaultCache(page.data.generatedAt));

	$effect(() => {
		if (initialTopVaults) {
			return;
		}

		fetchSettled = false;
		fetchAllVaultData(page.data.generatedAt)
			.then((allData) => {
				fetchedTopVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => v.denomination_slug === denominationSlug)
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (fetchSettled = true));
	});

	let title = $derived(`${denominationName} stablecoin vaults | Trading Strategy`);
	let description = $derived(shortDescription ?? `Top ${denominationName} DeFi vaults ranked by performance.`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived.by(() => {
		const logoPath = denominationSlug ? getStablecoinLogoUrl(denominationSlug) : undefined;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
	let aboutName = $derived(formatStablecoinDisplayName(stablecoinMetadata?.name, stablecoinMetadata?.symbol));
	let coingeckoHref = $derived(getStablecoinCoingeckoLink(stablecoinMetadata));
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
					image: logoUrl ?? undefined,
					url: stablecoinMetadata.links.homepage ?? undefined,
					category: stablecoinMetadata.category,
					sameAs: [coingeckoHref, stablecoinMetadata.links.defillama].filter(Boolean)
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
	stablecoinLogoSlug={denominationSlug}
	title="{denominationName} stablecoin vaults"
	showFilters
	defaultTvlKey="10k"
	defaultHideUnknown={0}
>
	{#snippet detailDescription()}
		{#if topVaults?.vaults.length}
			<VaultGroupDescription
				title="About {denominationSymbol} vaults"
				subject={denominationName}
				verbPhrase="is used in"
				vaults={topVaults.vaults}
			/>
		{/if}
	{/snippet}

	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="All {denominationSymbol} vaults: TVL and returns"
			dataUrl="/vaults/stablecoins/{denominationSlug}/chart-data"
			compareLabel="Compare all stablecoins"
			compareHref="/vaults/historical-tvl-stablecoin"
		/>
	{/snippet}
</TopVaultsPage>
