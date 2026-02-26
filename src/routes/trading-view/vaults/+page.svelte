<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();

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
	topVaults={data.topVaults}
	title="Top DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults across all blockchains"
	showFilters
/>
