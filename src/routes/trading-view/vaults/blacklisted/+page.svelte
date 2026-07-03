<!--
Blacklisted vault listing.
-->
<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import {
		MAX_SUMMARY_TVL_USD,
		calculateTotalTvl,
		getVaultCurrentTvlUsd,
		isBlacklisted
	} from '$lib/top-vaults/helpers';
	import { formatDollar } from '$lib/helpers/formatters';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache(page.data.generatedAt));

	$effect(() => {
		fetchAllVaultData(page.data.generatedAt)
			.then((data) => (topVaults = data))
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	let blacklistedTopVaults = $derived<TopVaults | undefined>(
		topVaults && {
			...topVaults,
			vaults: topVaults.vaults
				.filter(isBlacklisted)
				.toSorted((a, b) => (getVaultCurrentTvlUsd(b) ?? 0) - (getVaultCurrentTvlUsd(a) ?? 0))
		}
	);

	const title = 'Blacklisted DeFi stablecoin vaults';
	const description = 'Blacklisted DeFi stablecoin vaults, sorted by current TVL.';
	let blacklistedTvl = $derived(
		calculateTotalTvl(
			blacklistedTopVaults?.vaults.map((vault) => ({ current_nav: getVaultCurrentTvlUsd(vault) })) ?? [],
			{ maxTvlUsd: MAX_SUMMARY_TVL_USD }
		)
	);
	let blacklistedCountText = $derived(blacklistedTopVaults ? String(blacklistedTopVaults.vaults.length) : '-');
	let blacklistedTvlText = $derived(blacklistedTopVaults ? formatDollar(blacklistedTvl, 0) : '-');
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
			numberOfItems: blacklistedTopVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	topVaults={blacklistedTopVaults}
	{loading}
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
	totalVaultCount={topVaults?.vaults.length}
/>
