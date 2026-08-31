<!--
Vault listing and overview for one protocol.
-->
<script lang="ts">
	import { isPoolProtocol, UNKNOWN_VAULT_PROTOCOL_SLUG } from '$lib/top-vaults/helpers';
	import { getVaultListingDefaults } from '$lib/top-vaults/listing/definitions';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import Core3Ratings from '$lib/top-vaults/Core3Ratings.svelte';
	import XerberusRisk from '$lib/top-vaults/XerberusRisk.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';

	let { data } = $props();
	let { protocolSlug, protocolName, protocolMetadata, core3, xerberus, initialTopVaults } = $derived(data);
	let isUnknownVaultProtocolGroup = $derived(protocolSlug === UNKNOWN_VAULT_PROTOCOL_SLUG);
	let isHyperliquidProtocolGroup = $derived(protocolSlug === 'hyperliquid');
	let isPoolProtocolGroup = $derived(isPoolProtocol(protocolSlug));
	let listingAssetType = $derived(isPoolProtocolGroup ? 'pool' : 'vault');
	let listingAssetTypePlural = $derived(`${listingAssetType}s`);
	let listingDefaults = $derived(getVaultListingDefaults(data.listingKey, data.listingScope));

	const unknownVaultDescription =
		'These vaults are listed, but their underlying protocols have not been identified in the source dataset.';

	let title = $derived(
		isUnknownVaultProtocolGroup
			? 'Vaults with unidentified protocols'
			: isPoolProtocolGroup
				? `${protocolName} pools and yields`
				: `${protocolName} vaults and yields`
	);
	let heroTitle = $derived(
		isUnknownVaultProtocolGroup
			? 'Vaults with unidentified protocols'
			: isPoolProtocolGroup
				? `${protocolName} powered pools`
				: `${protocolName} powered stablecoin vaults`
	);
	let description = $derived(
		isUnknownVaultProtocolGroup
			? unknownVaultDescription
			: isPoolProtocolGroup
				? `Explore ${protocolName} pools and yields, including TVL and performance metrics.`
				: (protocolMetadata?.short_description ?? `Top stablecoin vaults on ${protocolName}`)
	);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived.by(() => {
		const logoPath = protocolMetadata?.logos.light
			? getVaultProtocolLogoUrl(protocolMetadata.slug, { format: 'original' })
			: protocolMetadata?.logos.dark;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
	let averageMonthlyReturn = $derived(data.listingSummary.avgTvlWeightedApy1M);
</script>

{#snippet unknownVaultSubtitle()}
	{unknownVaultDescription}
{/snippet}

{#snippet hyperliquidChainDescription()}
	<p>
		If you want to see both Hyperliquid native vaults and HyperEVM vaults, visit
		<a class="body-link" href={resolve('/vaults/chains/hyperliquid')}>Hyperliquid chain page</a>.
	</p>
{/snippet}

{#snippet protocolDescriptionExtra()}
	{#if averageMonthlyReturn != null}
		<p>
			The current listing contains <strong>{formatDollar(data.listingSummary.totalTvl, 1)}</strong> TVL in
			<strong
				>{data.listingSummary.matchingCount}
				{data.listingSummary.matchingCount === 1 ? listingAssetType : listingAssetTypePlural}</strong
			>
			with a TVL-weighted average monthly return of <strong>{formatPercent(averageMonthlyReturn, 1)}</strong>.
		</p>
	{/if}
	{#if isHyperliquidProtocolGroup}
		{@render hyperliquidChainDescription()}
	{/if}
{/snippet}

{#snippet protocolMiniChart()}
	<VaultGroupMiniChart
		title={`All ${protocolName} ${listingAssetTypePlural}: TVL and TVL-weighted 3-month annualised return`}
		dataUrl="/vaults/protocols/{protocolSlug}/chart-data"
		compareLabel="Compare all protocols"
		compareHref="/vaults/historical-tvl-protocol"
		returnTooltipLabel="TVL-weighted 3-month ann. return"
		returnWindowLabel="trailing 3-month"
		returnHistoryMonthsRequired={3}
	/>
{/snippet}

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	image={logoUrl}
	imageAlt={`${protocolName} logo`}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title,
		description,
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: logoUrl ? 'summary_large_image' : 'summary',
		title,
		description
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		image: logoUrl ?? undefined,
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: data.listingSummary.matchingCount
		}
	}}
/>

<TopVaultsPage
	topVaults={initialTopVaults}
	totalVaultCount={data.totalVaultCount}
	initialHasMore={data.initialHasMore}
	listingKey={data.listingKey}
	listingScope={data.listingScope}
	listingSummary={data.listingSummary}
	{protocolMetadata}
	protocolDescriptionExtra={averageMonthlyReturn != null || isHyperliquidProtocolGroup
		? protocolDescriptionExtra
		: undefined}
	detailAside={isUnknownVaultProtocolGroup ? undefined : protocolMiniChart}
	title={heroTitle}
	subtitle={isUnknownVaultProtocolGroup ? unknownVaultSubtitle : undefined}
	showFilters
	showUnknownFilter={false}
	defaultTvlKey={listingDefaults.tvl}
	defaultSort={listingDefaults.sort}
	defaultDirection={listingDefaults.direction}
	defaultHideUnknown={(listingDefaults.unknown ?? true) ? 1 : 0}
>
	{#snippet beforeTable()}
		{#if core3}
			<Core3Ratings {core3} {protocolName} />
		{/if}
		{#if xerberus}
			<XerberusRisk {xerberus} />
		{/if}
	{/snippet}
</TopVaultsPage>
