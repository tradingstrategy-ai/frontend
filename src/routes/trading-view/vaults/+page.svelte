<script lang="ts">
	import { page } from '$app/state';
	import type { TopVaults } from '$lib/top-vaults/schemas.js';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	const HYPERCORE_CHAIN_ID = 9999;
	const TVL_THRESHOLD_DEFAULT = 50_000;
	const TVL_THRESHOLD_HYPERCORE = 1_000_000;

	function filterByMinTvl(topVaults: TopVaults) {
		const vaults = topVaults.vaults.filter((vault) => {
			const threshold = vault.chain_id === HYPERCORE_CHAIN_ID ? TVL_THRESHOLD_HYPERCORE : TVL_THRESHOLD_DEFAULT;
			return (vault.current_nav ?? 0) >= threshold;
		});

		return { ...topVaults, vaults };
	}

	let { data } = $props();
	let topVaults = $derived(filterByMinTvl(data.topVaults));

	const title = 'Top DeFi stablecoin vaults';
	const description = 'The best DeFi vaults for all blockchains.';
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
	{topVaults}
	title="Top DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults across multiple blockchains"
/>
