<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { chain, chainSlug, chainName, topVaults } = $derived(data);

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
	title="Top {chainName} vaults"
	subtitle="The best performing stablecoin vaults on {chainName} with minimum $10k USD TVL"
	tvlThreshold={10000}
	filterTvl={true}
/>
