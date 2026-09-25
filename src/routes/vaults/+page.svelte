<!--
DeFi vault rankings — the landing page for "defi vaults" / "best defi vaults" searches.
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { getVaultSortDescription } from '$lib/top-vaults/vault-sort-description';
	import { getHubDescription, getItemListElements } from '$lib/top-vaults/hub-seo';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();

	// search wording: "defi vaults", "best defi vaults" (see .claude/plans/seo-round-4-vault-rankings.md)
	const title = 'Best DeFi vaults by APY and risk';
	const heading = 'Best DeFi vaults';
	let description = $derived(
		getHubDescription({
			subject: 'DeFi vaults',
			count: data.listingSummary.matchingCount,
			totalTvl: data.listingSummary.totalTvl,
			apy: data.listingSummary.avgTvlWeightedApy1M,
			updatedAt: data.initialTopVaults.generated_at
		})
	);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let rankingDescription = $derived(getVaultSortDescription(page.url.searchParams.get('sort')));
	let subtitle = $derived(`The best-performing DeFi vaults. Ranked by ${rankingDescription}.`);
</script>

<MetaTags
	{title}
	{description}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		dateModified: data.initialTopVaults.generated_at,
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: data.totalVaultCount,
			itemListElement: getItemListElements(data.initialTopVaults.vaults, page.url.origin)
		}
	}}
/>

<TopVaultsPage
	topVaults={data.initialTopVaults}
	totalVaultCount={data.totalVaultCount}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingSummary={data.listingSummary}
	listingInsights={data.listingInsights}
	insightsSubject="DeFi vaults"
	insightsGroupBy="protocol"
	title={heading}
	{subtitle}
	showFilters
/>
