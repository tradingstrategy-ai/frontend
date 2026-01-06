<script lang="ts">
	import { discordUrl } from '$lib/config';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import SocialMediaTags from './SocialMetaTags.svelte';
	import VaultPageHeader from './VaultPageHeader.svelte';
	import ChartWithFeaturedMetrics from './ChartWithFeaturedMetrics.svelte';
	import VaultMetrics from './VaultMetrics.svelte';
	import VaultTechnicalDetailsTable from './VaultTechnicalDetailsTable.svelte';
	import VaultPeriodicMetrics from './VaultPeriodicMetrics.svelte';
	import VaultProtocolInfo from './VaultProtocolInfo.svelte';
	import IconDiscord from '~icons/local/discord';
	import { hasSupportedProtocol, isBlacklisted } from '$lib/top-vaults/helpers';
	import VaultRankings from './VaultRankings.svelte';

	let { data } = $props();
	let { vault, chain, protocolMetadata } = $derived(data);
</script>

<SocialMediaTags {vault} {chain} />

<Breadcrumbs labels={{ [chain.slug]: chain.name, vaults: 'Top Vaults', [vault.vault_slug]: vault.name }} />

<main class="vault-details ds-3">
	<VaultPageHeader {vault} />

	<Section padding="md" --section-gap="var(--gap)">
		{#if isBlacklisted(vault)}
			<Alert size="md" title="Blacklisted">
				{vault.notes ?? 'Unknown reason'}
			</Alert>
		{/if}

		{#if !hasSupportedProtocol(vault)}
			<Alert size="md" status="warning" title="Protocol not supported">
				<div>
					This protocol is not supported yet. Contact us on Discord for information about how to include new protocols.
				</div>
				<Button slot="cta" size="sm" label="Join Discord" href={discordUrl} target="_blank" rel="noreferrer">
					<IconDiscord slot="icon" />
				</Button>
			</Alert>
		{/if}

		<VaultRankings {vault} {chain} />

		<ChartWithFeaturedMetrics {vault} />

		<VaultMetrics {vault} />

		{#if protocolMetadata}
			<VaultProtocolInfo {vault} {protocolMetadata} />
		{/if}

		<VaultPeriodicMetrics {vault} {chain} />

		<VaultTechnicalDetailsTable {vault} {chain} />
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.vault-details {
		:global(:is(.desktop, .mobile)) {
			display: contents;
		}

		@media (--viewport-sm-down) {
			--padding: 1.25rem;
			--gap: 1.5rem;

			:global(.desktop) {
				display: none;
			}
		}

		@media (--viewport-md-up) {
			--padding: 1.75rem;
			--gap: 2rem;

			:global(.mobile) {
				display: none;
			}
		}
	}
</style>
