<!--
International vault listing for non-USD-denominated vaults.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	let { data } = $props();
	let topVaults = $derived(data.initialTopVaults);

	function formatCurrencyList(currencies: string[]): string {
		if (currencies.length === 0) return 'unknown currencies';
		if (currencies.length === 1) return currencies[0];
		if (currencies.length === 2) return `${currencies[0]} and ${currencies[1]}`;

		return `${currencies.slice(0, -1).join(', ')}, and ${currencies[currencies.length - 1]}`;
	}

	const title = 'International stablecoin vaults';
	const description = 'DeFi vaults nominated in CHF, EUR, GBP, JPY, SGD, and TRY';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let pageSubtitle = $derived.by(() => {
		return `The current listing contains ${data.listingSummary.matchingCount} non-USD vaults with ${formatDollar(data.listingSummary.totalTvl, 0)} USD TVL with currencies of ${formatCurrencyList(data.listingCurrencies ?? [])}.`;
	});
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: data.listingSummary.matchingCount
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	loading={false}
	progressive={data.initialVaultListingHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	totalVaultCount={data.totalVaultCount}
	title="International stablecoin vaults"
	subtitle={pageSubtitle}
	showFilters
	defaultTvlKey="10k"
	defaultHideUnknown={0}
/>
