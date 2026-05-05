<script lang="ts">
	import type { Snippet } from 'svelte';
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
		/** Default monthly return filter key */
		defaultMonthlyReturnKey?: string;
		/** Default sort column key */
		defaultSort?: string;
		/** Default sort direction */
		defaultDirection?: 'asc' | 'desc';
		/** Show skeleton loading state while vault data is being fetched */
		loading?: boolean;
		/** Optional right-hand content for listing detail page overview panels */
		detailAside?: Snippet;
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
		defaultMonthlyReturnKey,
		defaultSort,
		defaultDirection,
		loading = false,
		detailAside
	}: Props = $props();

	let renderDetailAsideInHero = $derived(chain && detailAside && !protocolMetadata && !stablecoinMetadata);
</script>

<main class="top-vaults-page ds-3">
	<Section tag="header">
		<div class="top-vaults-header">
			<VaultListingsSelector />
			<div class:hero-layout={renderDetailAsideInHero}>
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

				{#if renderDetailAsideInHero && detailAside}
					<aside class="hero-aside">
						{@render detailAside()}
					</aside>
				{/if}
			</div>
		</div>
	</Section>

	<Section>
		<div class="top-vaults-content">
			{#if protocolMetadata && detailAside}
				<div class="detail-overview">
					<ProtocolDescription metadata={protocolMetadata} />
					<aside class="detail-aside">
						{@render detailAside()}
					</aside>
				</div>
			{:else if protocolMetadata}
				<ProtocolDescription metadata={protocolMetadata} />
			{/if}

			{#if stablecoinMetadata}
				<StablecoinDetailHeader metadata={stablecoinMetadata} vaults={topVaults?.vaults ?? []} {detailAside} />
			{/if}

			{#if !renderDetailAsideInHero && !protocolMetadata && !stablecoinMetadata && detailAside}
				<div class="detail-overview detail-overview-single">
					<aside class="detail-aside">
						{@render detailAside()}
					</aside>
				</div>
			{/if}

			{#if loading}
				<TopVaultsTable
					{chain}
					loading
					{showFilters}
					{defaultHideUnknown}
					{defaultMonthlyReturnKey}
					{defaultSort}
					{defaultDirection}
				/>
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
					{defaultMonthlyReturnKey}
					{defaultSort}
					{defaultDirection}
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
		.top-vaults-header {
			display: grid;
			gap: 1rem;
		}

		.hero-layout {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(22rem, 34rem);
			gap: 1rem;
			align-items: start;

			:global(.hero-banner) {
				padding-top: 0;
			}

			:global(.hero-banner .content) {
				place-content: start stretch;
			}
		}

		.hero-aside {
			display: grid;
			align-self: stretch;
		}

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

		.detail-overview {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(22rem, 34rem);
			gap: 1rem;
			align-items: stretch;
		}

		.detail-aside {
			display: grid;
			align-self: stretch;
		}

		.detail-overview-single {
			grid-template-columns: minmax(0, 1fr) minmax(22rem, 34rem);

			.detail-aside {
				grid-column: 2;
			}
		}

		@media (--viewport-sm-down) {
			.hero-layout {
				grid-template-columns: 1fr;
				align-items: stretch;
			}

			.detail-overview {
				grid-template-columns: 1fr;
			}

			.detail-overview-single .detail-aside {
				grid-column: auto;
			}
		}
	}
</style>
