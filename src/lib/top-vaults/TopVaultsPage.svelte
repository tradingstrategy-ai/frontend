<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Chain } from '$lib/helpers/chain';
	import type { TopVaults } from './schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
	import type { CuratorInfo } from './schemas';
	import Alert from '$lib/components/Alert.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsOptIn from './TopVaultsOptIn.svelte';
	import TopVaultsTable from './TopVaultsTable.svelte';
	import VaultListingsSelector from './VaultListingsSelector.svelte';
	import UpdateInfoButton from './UpdateInfoButton.svelte';
	import ProtocolDescription from '$lib/vault-protocol/ProtocolDescription.svelte';
	import CuratorDescription from '$lib/curator/CuratorDescription.svelte';
	import CuratorRecentPosts from '$lib/curator/CuratorRecentPosts.svelte';
	import StablecoinDescription from '$lib/stablecoin-metadata/StablecoinDescription.svelte';
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
		curatorMetadata?: CuratorInfo;
		/** Show interactive filter dropdowns (Min TVL, Min age, Max risk) */
		showFilters?: boolean;
		/** Default TVL filter key (used to initialise the dropdown when showFilters is true) */
		defaultTvlKey?: string;
		/** Default age filter index (used to initialise the dropdown when showFilters is true) */
		defaultAgeIndex?: number;
		/** Default risk filter index (used to initialise the dropdown when showFilters is true) */
		defaultRiskIndex?: number;
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
		/** Optional left-hand description box rendered next to detailAside (used by
		    chain pages on its own, and by stablecoin pages above the about box) */
		detailDescription?: Snippet;
		/** Optional content rendered above the vaults table (and its status line) */
		beforeTable?: Snippet;
		/** Whole-database vault count for the "out of {total}" listing meta on pre-filtered listings */
		totalVaultCount?: number;
		/** Include blacklisted vaults in the listing summary stats. */
		includeBlacklistedInStats?: boolean;
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
		curatorMetadata,
		showFilters,
		defaultTvlKey,
		defaultAgeIndex,
		defaultRiskIndex,
		defaultHideUnknown,
		defaultMonthlyReturnKey,
		defaultSort,
		defaultDirection,
		loading = false,
		detailAside,
		detailDescription,
		beforeTable,
		totalVaultCount,
		includeBlacklistedInStats
	}: Props = $props();

	let renderDetailAsideInHero = $derived(
		chain && detailAside && !detailDescription && !protocolMetadata && !stablecoinMetadata
	);
</script>

<main class="top-vaults-page ds-3">
	<Section tag="header">
		<div class="top-vaults-header">
			<div class="header-top">
				<VaultListingsSelector />
				{#if protocolMetadata || curatorMetadata}
					<div class="update-info">
						<UpdateInfoButton />
					</div>
				{/if}
			</div>
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
							{#if curatorMetadata?.logos.generic}
								<img src={curatorMetadata.logos.generic} alt={curatorMetadata.name} />
							{/if}
							<span>{pageTitle}</span>
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
				<div class="detail-overview wide-detail-overview">
					<ProtocolDescription metadata={protocolMetadata} />
					<aside class="detail-aside">
						{@render detailAside()}
					</aside>
				</div>
			{:else if protocolMetadata}
				<ProtocolDescription metadata={protocolMetadata} />
			{/if}

			{#if detailDescription && detailAside && !protocolMetadata && !stablecoinMetadata && !curatorMetadata}
				<div class="detail-overview wide-detail-overview">
					{@render detailDescription()}
					<aside class="detail-aside">
						{@render detailAside()}
					</aside>
				</div>
			{/if}

			{#if curatorMetadata}
				<div class={[detailAside && 'detail-overview wide-detail-overview']}>
					<div class="detail-main">
						<CuratorDescription curator={curatorMetadata} vaults={topVaults?.vaults ?? []} />
						{#if curatorMetadata.recent_posts.length > 0}
							<CuratorRecentPosts curator={curatorMetadata} />
						{/if}
					</div>
					{#if detailAside}
						<aside class="detail-aside">
							{@render detailAside()}
						</aside>
					{/if}
				</div>
			{/if}

			{#if stablecoinMetadata}
				<div class={[detailAside && 'detail-overview wide-detail-overview']}>
					<div class="detail-main">
						{@render detailDescription?.()}
						<StablecoinDescription metadata={stablecoinMetadata} />
					</div>
					{#if detailAside}
						<aside class="detail-aside">
							{@render detailAside()}
						</aside>
					{/if}
				</div>
			{/if}

			{#if !renderDetailAsideInHero && !protocolMetadata && !stablecoinMetadata && !curatorMetadata && !detailDescription && detailAside}
				<div class="detail-overview detail-overview-single">
					<aside class="detail-aside">
						{@render detailAside()}
					</aside>
				</div>
			{/if}

			{@render beforeTable?.()}

			{#if loading}
				<TopVaultsTable
					{chain}
					loading
					{showFilters}
					{defaultRiskIndex}
					{defaultHideUnknown}
					{defaultMonthlyReturnKey}
					{defaultSort}
					{defaultDirection}
					{includeBlacklistedInStats}
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
					{totalVaultCount}
					{chain}
					{tvlThreshold}
					{tvlTriggerLabel}
					{tvlTooltip}
					{filterTvl}
					{includeBlacklisted}
					{showFilters}
					{defaultTvlKey}
					{defaultAgeIndex}
					{defaultRiskIndex}
					{defaultHideUnknown}
					{defaultMonthlyReturnKey}
					{defaultSort}
					{defaultDirection}
					{includeBlacklistedInStats}
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

		.header-top {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 1rem;

			:global(.vault-listings-selector) {
				flex: 1;
			}

			.update-info {
				flex: none;
			}
		}

		.hero-layout {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(26rem, 44rem);
			gap: 1rem;
			align-items: start;

			:global(.hero-banner) {
				min-height: auto;
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

		.top-vaults-content {
			display: grid;
			gap: 1rem;
		}

		/* give the chart aside more room, at the expense of the about/description
		   column */
		.detail-overview {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(26rem, 44rem);
			gap: 1rem;
			align-items: stretch;
		}

		.detail-aside {
			display: grid;
			align-self: stretch;
		}

		/* Boxes stacked in the left column (about, posts, autogenerated stats); the
		   aside chart keeps a stable height (matching the typical collapsed column)
		   so expanding the posts or about widgets doesn't stretch and distort it */
		.detail-main {
			display: grid;
			gap: 1rem;
			min-width: 0;
			align-content: start;
		}

		@media (--viewport-lg-up) {
			.wide-detail-overview {
				align-items: start;

				.detail-aside {
					height: 28rem;
				}
			}
		}

		.detail-overview-single .detail-aside {
			grid-column: 2;
		}

		/* on tablet widths the two-column layout makes the box content unreadable —
		   stack the description and chart boxes vertically as on mobile */
		@media (--viewport-md-down) {
			.detail-overview {
				grid-template-columns: 1fr;
			}

			.detail-overview-single .detail-aside {
				grid-column: auto;
			}
		}

		@media (--viewport-sm-down) {
			.hero-layout {
				grid-template-columns: 1fr;
				align-items: stretch;
			}
		}
	}
</style>
