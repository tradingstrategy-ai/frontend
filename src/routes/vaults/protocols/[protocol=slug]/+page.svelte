<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import { isUnknownVaultProtocol, UNKNOWN_VAULT_PROTOCOL_SLUG } from '$lib/top-vaults/helpers';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import Core3Ratings from '$lib/top-vaults/Core3Ratings.svelte';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import VaultGroupMiniChart from '../../VaultGroupMiniChart.svelte';

	let { data } = $props();
	let { protocolSlug, protocolName, protocolMetadata, core3, initialTopVaults } = $derived(data);
	let isUnknownVaultProtocolGroup = $derived(protocolSlug === UNKNOWN_VAULT_PROTOCOL_SLUG);
	let isHyperliquidProtocolGroup = $derived(protocolSlug === 'hyperliquid');

	let fetchedTopVaults = $state<TopVaults>();
	let fetchSettled = $state(false);
	let topVaults = $derived(initialTopVaults ?? fetchedTopVaults);
	let loading = $derived(!initialTopVaults && !fetchSettled && !hasVaultCache(page.data.generatedAt));

	$effect(() => {
		if (initialTopVaults) {
			return;
		}

		fetchSettled = false;
		fetchAllVaultData(page.data.generatedAt)
			.then((allData) => {
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
		const logoPath = protocolMetadata?.logos.light ? getVaultProtocolLogoUrl(protocolMetadata.slug) : undefined;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
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

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title,
		description,
		images: logoUrl ? [{ url: logoUrl }] : [],
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: logoUrl ? 'summary_large_image' : 'summary',
		title,
		description,
		image: logoUrl ?? undefined
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
	{loading}
	{protocolMetadata}
	protocolDescriptionExtra={isHyperliquidProtocolGroup ? hyperliquidChainDescription : undefined}
	title={heroTitle}
	subtitle={isUnknownVaultProtocolGroup ? unknownVaultSubtitle : undefined}
	showFilters
	showUnknownFilter={false}
	defaultTvlKey="10k"
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
