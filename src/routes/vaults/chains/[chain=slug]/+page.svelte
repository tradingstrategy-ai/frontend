<!--
Vault listing and overview for one blockchain or perpetual DEX venue.
-->
<script lang="ts">
	import { isPerpDexChainId } from '$lib/helpers/chain';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';
	import VaultGroupDescription from '../../VaultGroupDescription.svelte';
	import { getBlockchainSocialLogoUrl } from '$lib/social-card/helpers';
	import { getHubDescription } from '$lib/top-vaults/hub-seo';

	let { data } = $props();
	let { chain, chainSlug, chainName, initialTopVaults, hasSameNameProtocol } = $derived(data);

	// "<chain> vaults" is the search phrase; when a protocol shares the chain's name its hub owns
	// that phrase, so this page says "Vaults on <chain>" instead of competing for it
	let heading = $derived(hasSameNameProtocol ? `Vaults on ${chainName}` : `${chainName} vaults`);
	let titleParts = $derived([heading, 'APY, TVL and risk']);
	let description = $derived(
		getHubDescription({
			subject: hasSameNameProtocol ? `vaults on ${chainName}` : `${chainName} vaults`,
			count: data.listingSummary.matchingCount,
			totalTvl: data.listingSummary.totalTvl,
			apy: data.listingSummary.avgTvlWeightedApy1M,
			updatedAt: initialTopVaults.generated_at
		})
	);
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
	{titleParts}
	{description}
	image={logoUrl}
	imageAlt={`${chainName} blockchain logo`}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title: heading, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', title: heading, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: heading,
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
	topVaults={initialTopVaults}
	totalVaultCount={data.totalVaultCount}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingScope={data.listingScope}
	listingSummary={data.listingSummary}
	title={heading}
	showFilters
	{defaultTvlKey}
>
	{#snippet detailDescription()}
		{#if initialTopVaults.vaults.length}
			<VaultGroupDescription
				title="About {chainName} vaults"
				subject={descriptionSubject}
				vaults={initialTopVaults.vaults}
				listingSummary={data.initialHasMore ? data.listingSummary : undefined}
			/>
		{:else}
			<div></div>
		{/if}
	{/snippet}

	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="{heading}: TVL and returns"
			dataUrl="/vaults/chains/{chainSlug}/chart-data"
			compareLabel="Compare all chains"
			compareHref="/vaults/historical-tvl-chain"
		/>
	{/snippet}
</TopVaultsPage>
