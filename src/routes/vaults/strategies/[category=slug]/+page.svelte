<!--
Vault listing for a source-defined investment strategy category.
-->
<script lang="ts">
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { getVaultListingDefaults } from '$lib/top-vaults/listing/definitions';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultCategoryDescription from '../../VaultCategoryDescription.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';

	let { data } = $props();
	let { category, categorySlug, hasChartData, initialTopVaults } = $derived(data);
	let defaults = $derived(getVaultListingDefaults(data.listingKey, data.listingScope));
	let title = $derived(`${category.label} vaults | Trading Strategy`);
	let description = $derived(`Explore ${category.label.toLowerCase()} vaults, their TVL, and recent returns.`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let heading = $derived(`${category.label} vaults`);
</script>

{#snippet detailDescription()}
	<VaultCategoryDescription {category} />
{/snippet}

{#snippet detailAside()}
	<VaultGroupMiniChart
		title={`${category.label} vaults: TVL and returns`}
		dataUrl={`/vaults/strategies/${categorySlug}/chart-data`}
		compareLabel="Compare strategies"
		compareHref="/vaults/strategies"
	/>
{/snippet}

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
		mainEntity: { '@type': 'ItemList', numberOfItems: data.listingSummary.matchingCount }
	}}
/>

<TopVaultsPage
	topVaults={initialTopVaults}
	totalVaultCount={data.totalVaultCount}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingScope={data.listingScope}
	listingSummary={data.listingSummary}
	title={heading}
	showFilters
	defaultTvlKey={defaults.tvl}
	defaultSort={defaults.sort}
	defaultDirection={defaults.direction}
	defaultHideUnknown={(defaults.unknown ?? true) ? 1 : 0}
	{detailDescription}
	detailAside={hasChartData ? detailAside : undefined}
></TopVaultsPage>
