<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { topVaults, maxAgeDays } = $derived(data);

	const title = 'New DeFi stablecoin vaults';
	let description = $derived(
		`The best performing DeFi stablecoin vaults that started within the last ${maxAgeDays} days.`
	);
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
	title="New DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults that started within the last {maxAgeDays} days"
	tvlThreshold={10_000}
	filterTvl
/>
