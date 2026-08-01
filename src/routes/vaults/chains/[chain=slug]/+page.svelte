<script lang="ts">
	import { isPerpDexChainId } from '$lib/helpers/chain';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';
	import VaultGroupDescription from '../../VaultGroupDescription.svelte';
	import { getBlockchainSocialLogoUrl } from '$lib/social-card/helpers';

	let { data } = $props();
	let { chain, chainSlug, chainName, initialTopVaults } = $derived(data);
	let topVaults = $derived(initialTopVaults);
	let totalVaultCount = $derived(data.totalVaultCount);
	let loading = false;

	let title = $derived(`${chainName} stablecoin vaults`);
	let description = $derived(`Top stablecoin vaults on ${chainName} blockchain ranked by performance.`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived(getBlockchainSocialLogoUrl(chainSlug));
	let defaultTvlKey = $derived(chainSlug === 'robinhood' ? 'any' : '10k');
	// Perp DEX venues (chain IDs 9900–9999) are not real blockchains, so the
	// generated description opens with a perp DEX phrasing instead of "blockchain".
	let isPerpDex = $derived(isPerpDexChainId(chain?.id));
	let descriptionSubject = $derived(
		isPerpDex ? `${chainName} perpetual futures decentralised exchange (perp DEX)` : `${chainName} blockchain`
	);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	image={logoUrl}
	imageAlt={`${chainName} blockchain logo`}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', title, description }}
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
	{chain}
	{topVaults}
	{totalVaultCount}
	{loading}
	progressive={data.initialVaultListingHasMore}
	listingKey={data.listingKey}
	listingScope={data.listingScope}
	listingSummary={data.listingSummary}
	title="{chainName} stablecoin vaults"
	showFilters
	{defaultTvlKey}
>
	{#snippet detailDescription()}
		{#if topVaults?.vaults.length}
			<VaultGroupDescription
				title="About {chainName} vaults"
				subject={descriptionSubject}
				vaults={topVaults.vaults}
				listingSummary={data.initialVaultListingHasMore ? data.listingSummary : undefined}
			/>
		{:else}
			<div></div>
		{/if}
	{/snippet}

	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="{chainName} stablecoin vaults: TVL and returns"
			dataUrl="/vaults/chains/{chainSlug}/chart-data"
			compareLabel="Compare all chains"
			compareHref="/vaults/historical-tvl-chain"
		/>
	{/snippet}
</TopVaultsPage>
