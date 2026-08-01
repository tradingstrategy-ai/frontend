<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { getChainsBySlug, isPerpDexChainId } from '$lib/helpers/chain';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';
	import VaultGroupDescription from '../../VaultGroupDescription.svelte';
	import { getBlockchainSocialLogoUrl } from '$lib/social-card/helpers';

	let { data } = $props();
	let { chain, chainSlug, chainName, initialTopVaults } = $derived(data);

	let fetchedTopVaults = $state<TopVaults>();
	let fetchedTotalVaultCount = $state<number>();
	let fetchSettled = $state(false);
	let topVaults = $derived(initialTopVaults ?? fetchedTopVaults);
	let totalVaultCount = $derived(initialTopVaults ? data.totalVaultCount : fetchedTotalVaultCount);
	let loading = $derived(!initialTopVaults && !fetchSettled && !hasVaultCache(page.data.generatedAt));

	$effect(() => {
		if (initialTopVaults) {
			return;
		}

		fetchSettled = false;
		fetchAllVaultData(page.data.generatedAt)
			.then((allData) => {
				fetchedTotalVaultCount = allData.vaults.length;
				// Include vaults from all chains sharing this slug (e.g. HyperEVM + HyperCore)
				const chainIds = new Set(getChainsBySlug(chainSlug).map((c) => c.id));
				fetchedTopVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => chainIds.has(v.chain_id))
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (fetchSettled = true));
	});

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
	{chain}
	{topVaults}
	{totalVaultCount}
	{loading}
	title="{chainName} stablecoin vaults"
	showFilters
	{defaultTvlKey}
>
	{#snippet detailDescription()}
		{#if topVaults?.vaults.length}
			<VaultGroupDescription title="About {chainName} vaults" subject={descriptionSubject} vaults={topVaults.vaults} />
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
