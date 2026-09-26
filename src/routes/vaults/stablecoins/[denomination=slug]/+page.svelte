<!--
Vault listing and overview for one stablecoin denomination.
-->
<script lang="ts">
	import {
		formatStablecoinDisplayName,
		getStablecoinCoingeckoLink,
		getStablecoinLogoUrl
	} from '$lib/stablecoin-metadata/helpers';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';
	import VaultGroupDescription from '../../VaultGroupDescription.svelte';
	import { getHubDescription, getItemListElements, getHubTitleParts } from '$lib/top-vaults/hub-seo';

	let { data } = $props();
	let {
		denominationSlug,
		denominationSymbol,
		denominationName,
		shortDescription,
		stablecoinMetadata,
		initialTopVaults
	} = $derived(data);

	// search wording: "usdc vault", "usdc yield", "best usdc yield" (see .claude/plans/seo-round-4-vault-rankings.md)
	let heading = $derived(`${denominationSymbol} vaults`);
	let titleParts = $derived(getHubTitleParts(heading, [`best ${denominationSymbol} yield`, 'APY and TVL']));
	let description = $derived(
		getHubDescription({
			subject: `${denominationSymbol} vaults`,
			count: data.listingSummary.matchingCount,
			totalTvl: data.listingSummary.totalTvl,
			apy: data.listingSummary.avgTvlWeightedApy1M,
			updatedAt: initialTopVaults.generated_at,
			about: shortDescription
		})
	);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived.by(() => {
		const logoPath = stablecoinMetadata?.logos.light
			? getStablecoinLogoUrl(stablecoinMetadata.slug, { format: 'original' })
			: undefined;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
	let aboutName = $derived(formatStablecoinDisplayName(stablecoinMetadata?.name, stablecoinMetadata?.symbol));
	let coingeckoHref = $derived(getStablecoinCoingeckoLink(stablecoinMetadata));
</script>

<MetaTags
	{titleParts}
	{description}
	image={logoUrl}
	imageAlt={`${denominationName} logo`}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title: heading,
		description,
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: logoUrl ? 'summary_large_image' : 'summary',
		title: heading,
		description
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		dateModified: initialTopVaults.generated_at,
		name: heading,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		image: logoUrl ?? undefined,
		about: stablecoinMetadata
			? {
					'@type': 'FinancialProduct',
					name: aboutName ?? stablecoinMetadata.name,
					description: stablecoinMetadata.short_description,
					image: logoUrl ?? undefined,
					url: stablecoinMetadata.links.homepage ?? undefined,
					category: stablecoinMetadata.category,
					sameAs: [coingeckoHref, stablecoinMetadata.links.defillama].filter(Boolean)
				}
			: undefined,
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: data.listingSummary.matchingCount,
			itemListElement: getItemListElements(initialTopVaults.vaults, page.url.origin)
		}
	}}
/>

<TopVaultsPage
	topVaults={initialTopVaults}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingScope={data.listingScope}
	listingSummary={data.listingSummary}
	{stablecoinMetadata}
	stablecoinLogoSlug={denominationSlug}
	title={heading}
	showFilters
	defaultTvlKey="10k"
	defaultHideUnknown={0}
>
	{#snippet detailDescription()}
		{#if initialTopVaults.vaults.length}
			<VaultGroupDescription
				title="About {denominationSymbol} vaults"
				subject={denominationName}
				verbPhrase="is used in"
				vaults={initialTopVaults.vaults}
				listingSummary={data.initialHasMore ? data.listingSummary : undefined}
			/>
		{/if}
	{/snippet}

	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="All {denominationSymbol} vaults: TVL and returns"
			dataUrl="/vaults/stablecoins/{denominationSlug}/chart-data"
			compareLabel="Compare all stablecoins"
			compareHref="/vaults/historical-tvl-stablecoin"
		/>
	{/snippet}
</TopVaultsPage>
