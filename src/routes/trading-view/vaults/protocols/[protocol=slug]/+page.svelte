<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { protocolSlug, protocolName, topVaults, protocolMetadata } = $derived(data);

	let title = $derived(`${protocolName} top vaults`);
	let description = $derived(`Top stablecoin vaults on ${protocolName}`);
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
	{protocolMetadata}
	title="Top {protocolName} vaults"
	subtitle="Top stablecoin vaults on {protocolName}"
	showFilters
	defaultTvlKey="10k"
/>
