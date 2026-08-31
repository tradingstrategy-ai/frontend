<!--
International vault listing for non-USD-denominated vaults.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	let { data } = $props();

	/**
	 * Format listing currencies as a readable English list.
	 *
	 * @param currencies - Currency codes included in the current listing.
	 */
	function formatCurrencyList(currencies: string[]): string {
		if (currencies.length === 0) return 'unknown currencies';
		if (currencies.length === 1) return currencies[0];
		if (currencies.length === 2) return `${currencies[0]} and ${currencies[1]}`;

		return `${currencies.slice(0, -1).join(', ')}, and ${currencies[currencies.length - 1]}`;
	}

	const title = 'International stablecoin vaults';
	const description = 'DeFi vaults denominated in currencies such as CHF, EUR, GBP, JPY, SGD, and TRY.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let pageSubtitle = $derived.by(() => {
		return `The current listing contains ${data.listingSummary.matchingCount} non-USD vaults with ${formatDollar(data.listingSummary.totalTvl, 0)} TVL, denominated in ${formatCurrencyList(data.listingCurrencies ?? [])}.`;
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
	topVaults={data.initialTopVaults}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	totalVaultCount={data.totalVaultCount}
	title="International stablecoin vaults"
	subtitle={pageSubtitle}
	showFilters
	defaultTvlKey="10k"
	defaultHideUnknown={0}
/>
