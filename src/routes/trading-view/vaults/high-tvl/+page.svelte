<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();

	const title = 'High TVL DeFi stablecoin vaults';
	const description = 'The best performing DeFi stablecoin vaults with more than $2M TVL.';
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
	title="High TVL stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults with more than $2M TVL"
	showFilters
	defaultTvlKey="2m"
/>
