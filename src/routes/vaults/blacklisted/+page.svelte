<!--
Blacklisted vault listing.
-->
<script lang="ts">
	import { MAX_SUMMARY_TVL_USD } from '$lib/top-vaults/helpers';
	import { formatDollar } from '$lib/helpers/formatters';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let { data } = $props();
	let blacklistedTopVaults = $derived(data.initialTopVaults);

	const title = 'Blacklisted DeFi stablecoin vaults';
	const description = 'Blacklisted DeFi stablecoin vaults, sorted by current TVL.';
	let blacklistedCountText = $derived(String(data.listingSummary.matchingCount));
	let blacklistedTvlText = $derived(formatDollar(data.listingSummary.totalTvl, 0));
	let subtitle = $derived(
		`Blacklisted ${blacklistedCountText} vaults and ${blacklistedTvlText} TVL (some of this TVL is likely to be fake). Blacklisting reasons include illiquidity, depegging of the denominating fiat token, being a subvault of a composite, and suspicious activities.`
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
	topVaults={blacklistedTopVaults}
	loading={false}
	progressive={data.initialVaultListingHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	includeBlacklisted
	includeBlacklistedInStats
	maxSummaryTvlUsd={MAX_SUMMARY_TVL_USD}
	disableBlacklistedStrikethrough
	title="Blacklisted stablecoin vaults"
	{subtitle}
	showFilters
	defaultTvlKey="any"
	defaultRiskIndex={0}
	defaultHideUnknown={0}
	defaultSort="tvl"
	defaultDirection="desc"
	totalVaultCount={data.totalVaultCount}
/>
