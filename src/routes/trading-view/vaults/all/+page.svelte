<!--
All vaults listing including problematic/blacklisted vaults
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { formatDollar } from '$lib/helpers/formatters.js';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { topVaults, tvlThreshold } = $derived(data);

	let minTvlString = $derived(formatDollar(tvlThreshold, 0));

	const title = 'All DeFi stablecoin vaults';
	const description = 'All stablecoin vaults, including ones with stuck funds and oracle problems.';
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
	{tvlThreshold}
	includeBlacklisted
	title="All stablecoin vaults"
	subtitle="All stablecoin vaults, including ones with stuck funds and oracle problems"
/>
