<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { denominationSlug, denominationName, topVaults } = $derived(data);

	let title = $derived(`${denominationName} top vaults | Trading Strategy`);
	let description = $derived(`Top ${denominationName} DeFi vaults ranked by performance.`);
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
	title="Top {denominationName} vaults"
	subtitle="The best performing {denominationName} DeFi vaults with minimum $10k USD TVL"
	tvlThreshold={10000}
	filterTvl={true}
/>
