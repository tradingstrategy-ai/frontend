<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import {
		calculateTotalTvl,
		calculateTvlWeightedApy,
		isBlacklisted,
		isEligibleVaultGroupMiniChartVault,
		isUnknownVaultProtocol,
		UNKNOWN_VAULT_PROTOCOL_SLUG
	} from '$lib/top-vaults/helpers';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { VAULT_TVL_OUTLIER_THRESHOLD } from '$lib/echarts/tvl-outliers';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import Core3Ratings from '$lib/top-vaults/Core3Ratings.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';

	let { data } = $props();
	let { protocolSlug, protocolName, protocolMetadata, core3, initialTopVaults } = $derived(data);
	let isUnknownVaultProtocolGroup = $derived(protocolSlug === UNKNOWN_VAULT_PROTOCOL_SLUG);
	let isHyperliquidProtocolGroup = $derived(protocolSlug === 'hyperliquid');
	let isApexProtocolGroup = $derived(protocolSlug === 'apex');

	// Apex does not have a track record yet, so its vaults sit below the usual TVL
	// threshold. Default the Min TVL filter to "Any" so they are not hidden.
	let defaultTvlKey = $derived(isApexProtocolGroup ? 'any' : '10k');

	let fetchedTopVaults = $state<TopVaults>();
	let fetchedTotalVaultCount = $state<number>();
	let fetchSettled = $state(false);
	let topVaults = $derived(initialTopVaults ?? fetchedTopVaults);
	let totalVaultCount = $derived(initialTopVaults ? data.totalVaultCount : fetchedTotalVaultCount);
	let loading = $derived(!initialTopVaults && !fetchSettled && !hasVaultCache(page.data.generatedAt));

	$effect(() => {
		if (initialTopVaults) {
			return;
		}

		fetchSettled = false;
		fetchAllVaultData(page.data.generatedAt)
			.then((allData) => {
				fetchedTotalVaultCount = allData.vaults.length;
				fetchedTopVaults = {
					...allData,
					vaults: allData.vaults.filter((vault) =>
						isUnknownVaultProtocolGroup ? isUnknownVaultProtocol(vault) : vault.protocol_slug === protocolSlug
					)
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (fetchSettled = true));
	});

	const unknownVaultDescription = 'These vaults are not yet mapped out. Contact us to have your vaults listed.';

	let title = $derived(isUnknownVaultProtocolGroup ? 'Unknown vaults' : `${protocolName} vaults and yields`);
	let heroTitle = $derived(
		isUnknownVaultProtocolGroup ? 'Unknown vaults' : `${protocolName} powered stablecoin vaults`
	);
	let description = $derived(
		isUnknownVaultProtocolGroup
			? unknownVaultDescription
			: (protocolMetadata?.short_description ?? `Top stablecoin vaults on ${protocolName}`)
	);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let logoUrl = $derived.by(() => {
		const logoPath = protocolMetadata?.logos.light
			? getVaultProtocolLogoUrl(protocolMetadata.slug, { format: 'original' })
			: protocolMetadata?.logos.dark;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
	let statsVaults = $derived(
		(topVaults?.vaults ?? []).filter(
			(vault) => !isBlacklisted(vault) && (vault.current_nav ?? 0) <= VAULT_TVL_OUTLIER_THRESHOLD
		)
	);
	let totalTvl = $derived(calculateTotalTvl(statsVaults));
	let averageMonthlyReturn = $derived(calculateTvlWeightedApy(statsVaults.filter(isEligibleVaultGroupMiniChartVault)));
</script>

{#snippet unknownVaultSubtitle()}
	These vaults are not yet mapped out. <a class="body-link" href={resolve('/community')}>Contact us</a> to have your vaults
	listed.
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
			{protocolName} has <strong>{formatDollar(totalTvl, 1)}</strong> TVL in
			<strong>{statsVaults.length} {statsVaults.length === 1 ? 'vault' : 'vaults'}</strong> with the TVL-weighted
			average monthly returns of <strong>{formatPercent(averageMonthlyReturn, 1)}</strong>.
		</p>
	{/if}
	{#if isHyperliquidProtocolGroup}
		{@render hyperliquidChainDescription()}
	{/if}
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
			numberOfItems: topVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	{totalVaultCount}
	{loading}
	{protocolMetadata}
	protocolDescriptionExtra={averageMonthlyReturn != null || isHyperliquidProtocolGroup
		? protocolDescriptionExtra
		: undefined}
	title={heroTitle}
	subtitle={isUnknownVaultProtocolGroup ? unknownVaultSubtitle : undefined}
	showFilters
	showUnknownFilter={false}
	{defaultTvlKey}
	defaultHideUnknown={isUnknownVaultProtocolGroup ? 0 : 1}
>
	{#snippet detailAside()}
		<VaultGroupMiniChart
			title="All {protocolName} vaults: TVL and TVL-weighted 3-month annualised return"
			dataUrl="/vaults/protocols/{protocolSlug}/chart-data"
			compareLabel="Compare all protocols"
			compareHref="/vaults/historical-tvl-protocol"
			returnTooltipLabel="TVL-weighted 3-month ann. return"
			returnWindowLabel="trailing 3-month"
			returnHistoryMonthsRequired={3}
		/>
	{/snippet}

	{#snippet beforeTable()}
		{#if core3}
			<Core3Ratings {core3} {protocolName} collapsible />
		{/if}
	{/snippet}
</TopVaultsPage>
