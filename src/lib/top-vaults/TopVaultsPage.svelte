<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { TopVaults } from './schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import Alert from '$lib/components/Alert.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsOptIn from './TopVaultsOptIn.svelte';
	import TopVaultsTable from './TopVaultsTable.svelte';
	import VaultListingsSelector from './VaultListingsSelector.svelte';
	import ProtocolDescription from '$lib/vault-protocol/ProtocolDescription.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		chain?: Chain;
		topVaults: TopVaults;
		title: string;
		subtitle: string;
		tvlThreshold?: number;
		filterTvl?: boolean;
		includeBlacklisted?: boolean;
		protocolMetadata?: VaultProtocolMetadata;
	}

	let { chain, topVaults, title: pageTitle, subtitle, tvlThreshold, filterTvl, includeBlacklisted, protocolMetadata }: Props = $props();
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
						<img src={protocolMetadata.logos.light} alt={protocolMetadata.name} />
					{/if}
					<span>{pageTitle}</span>
					<DataBadge class="badge" status="warning">Beta</DataBadge>
				</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<div class="top-vaults-content">
			{#if protocolMetadata}
				<ProtocolDescription metadata={protocolMetadata} />
			{/if}

			{#if !topVaults.vaults.length}
				<Alert title="Error">No vault data available.</Alert>
			{:else}
				<TopVaultsTable {topVaults} {chain} {tvlThreshold} {filterTvl} {includeBlacklisted} />
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
			font-size: 0.5em;
		}

		.top-vaults-content {
			display: grid;
			gap: 1rem;
		}
	}
</style>
