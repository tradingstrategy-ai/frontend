<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { getChainsBySlug } from '$lib/helpers/chain';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';
	import VaultGroupDescription from '../../VaultGroupDescription.svelte';

	let { data } = $props();
	let { chain, chainSlug, chainName } = $derived(data);

	let topVaults = $state<TopVaults>();
	let totalVaultCount = $state<number>();
	let loading = $state(!hasVaultCache(page.data.generatedAt));

	$effect(() => {
		fetchAllVaultData(page.data.generatedAt)
			.then((allData) => {
				totalVaultCount = allData.vaults.length;
				// Include vaults from all chains sharing this slug (e.g. HyperEVM + HyperCore)
				const chainIds = new Set(getChainsBySlug(chainSlug).map((c) => c.id));
				topVaults = {
					...allData,
					vaults: allData.vaults.filter((v) => chainIds.has(v.chain_id))
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	let title = $derived(`${chainName} stablecoin vaults`);
	let description = $derived(`Top stablecoin vaults on ${chainName} blockchain ranked by performance.`);
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
	{chain}
	{topVaults}
	{totalVaultCount}
	{loading}
	title="{chainName} stablecoin vaults"
	showFilters
	defaultTvlKey="10k"
>
	{#snippet detailDescription()}
		{#if topVaults?.vaults.length}
			<VaultGroupDescription
				title="About {chainName} vaults"
				subject="{chainName} blockchain"
				vaults={topVaults.vaults}
			/>
		{:else}
			<div></div>
		{/if}
	{/snippet}

	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="{chainName} stablecoin vaults: TVL and returns"
			dataUrl="/trading-view/vaults/chains/{chainSlug}/chart-data"
			compareLabel="Compare all chains"
			compareHref="/trading-view/vaults/historical-tvl-chain"
		/>
	{/snippet}
</TopVaultsPage>
