<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { getChainsBySlug } from '$lib/helpers/chain';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { chain, chainSlug, chainName } = $derived(data);

	let topVaults = $state<TopVaults>();
	let loading = $state(true);

	async function loadVaults() {
		try {
			const resp = await fetch('/top-vaults/all-data');
			if (!resp.ok) throw new Error(`Failed to fetch vault data: ${resp.status}`);
			const allData: TopVaults = await resp.json();
			// Include vaults from all chains sharing this slug (e.g. HyperEVM + HyperCore)
			const chainIds = new Set(getChainsBySlug(chainSlug).map((c) => c.id));
			topVaults = {
				...allData,
				vaults: allData.vaults.filter((v) => chainIds.has(v.chain_id))
			};
		} catch (e) {
			console.error('Failed to load vault data:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadVaults();
	});

	let title = $derived(`${chainName} top vaults`);
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

<TopVaultsPage
	{chain}
	{topVaults}
	{loading}
	title="Top {chainName} vaults"
	subtitle="The best performing stablecoin vaults on {chainName}"
	showFilters
	defaultTvlKey="10k"
/>
