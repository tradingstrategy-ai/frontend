<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { formatDollar } from '$lib/helpers/formatters.js';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { topVaults, tvlThreshold } = $derived(data);

	let minTvlString = $derived(formatDollar(tvlThreshold, 0));

	const title = 'High TVL DeFi stablecoin vaults';
	let description = $derived(`The best performing DeFi stablecoin vaults with more than ${minTvlString} TVL.`);
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
	title="High TVL stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults with more than {minTvlString} TVL"
/>
