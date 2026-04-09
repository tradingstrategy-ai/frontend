<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { TopVaults } from './schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
	import Alert from '$lib/components/Alert.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsOptIn from './TopVaultsOptIn.svelte';
	import TopVaultsTable from './TopVaultsTable.svelte';
	import VaultListingsSelector from './VaultListingsSelector.svelte';
	import ProtocolDescription from '$lib/vault-protocol/ProtocolDescription.svelte';
	import StablecoinDetailHeader from '$lib/stablecoin-metadata/StablecoinDetailHeader.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getStablecoinLogoUrl } from '$lib/stablecoin-metadata/helpers.js';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';

	interface Props {
		chain?: Chain;
		/** Vault dataset to display; may be undefined while loading */
		topVaults?: TopVaults;
		title: string;
		subtitle?: string;
		tvlThreshold?: number;
		tvlTriggerLabel?: string;
		tvlTooltip?: string;
		filterTvl?: boolean;
		includeBlacklisted?: boolean;
		protocolMetadata?: VaultProtocolMetadata;
		stablecoinMetadata?: StablecoinMetadata;
		/** Show interactive filter dropdowns (Min TVL, Min age, Max risk) */
		showFilters?: boolean;
		/** Default TVL filter key (used to initialise the dropdown when showFilters is true) */
		defaultTvlKey?: string;
		/** Default age filter index (used to initialise the dropdown when showFilters is true) */
		defaultAgeIndex?: number;
		/** Default value for the "Hide unknown" filter (1 = hide, 0 = show) */
		defaultHideUnknown?: number;
		/** Show skeleton loading state while vault data is being fetched */
		loading?: boolean;
	}

	let {
		chain,
		topVaults,
		title: pageTitle,
		subtitle,
		tvlThreshold,
		tvlTriggerLabel,
		tvlTooltip,
		filterTvl,
		includeBlacklisted,
		protocolMetadata,
		stablecoinMetadata,
		showFilters,
		defaultTvlKey,
		defaultAgeIndex,
		defaultHideUnknown,
		loading = false
	}: Props = $props();
</script>

<main class="top-vaults-page ds-3">
	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner {subtitle}>
			{#snippet title()}
				<span class="page-title">
					{#if chain}
						<img src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
					{/if}
					{#if protocolMetadata?.logos.light}
						{@const protocolLogoUrl = getVaultProtocolLogoUrl(protocolMetadata.slug)}
						{#if protocolLogoUrl}
							<img src={protocolLogoUrl} alt={protocolMetadata.name} />
						{/if}
					{/if}
					{#if stablecoinMetadata?.logos.light}
						{@const stablecoinLogoUrl = getStablecoinLogoUrl(stablecoinMetadata.slug)}
						{#if stablecoinLogoUrl}
							<img src={stablecoinLogoUrl} alt={stablecoinMetadata.name} />
						{/if}
					{/if}
					<span>{pageTitle}</span>
					<DataBadge class="badge" status="beta">Beta</DataBadge>
				</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<div class="top-vaults-content">
			{#if protocolMetadata}
				<ProtocolDescription metadata={protocolMetadata} />
			{/if}

			{#if stablecoinMetadata}
				<StablecoinDetailHeader metadata={stablecoinMetadata} vaults={topVaults?.vaults ?? []} />
			{/if}

			{#if loading}
				<TopVaultsTable {chain} loading {showFilters} {defaultHideUnknown} />
			{:else if !topVaults?.vaults.length}
				{#if stablecoinMetadata}
					<Alert status="info">We have not indexed any vaults using this stablecoin as a denomination token yet.</Alert>
				{:else}
					<Alert title="Error">No vault data available.</Alert>
				{/if}
			{:else}
				<TopVaultsTable
					{topVaults}
					{chain}
					{tvlThreshold}
					{tvlTriggerLabel}
					{tvlTooltip}
					{filterTvl}
					{includeBlacklisted}
					{showFilters}
					{defaultTvlKey}
					{defaultAgeIndex}
					{defaultHideUnknown}
				/>
			{/if}
		</div>
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.top-vaults-page {
		.page-title {
			display: inline-flex;
			flex-wrap: wrap;
			gap: 0.25em;
			align-items: center;
		}

		img {
			height: 1em;
		}

		:global(.badge) {
			font-size: 0.44em;
		}

		.top-vaults-content {
			display: grid;
			gap: 1rem;
		}
	}
</style>
