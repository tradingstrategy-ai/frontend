<script lang="ts">
	import { discordUrl } from '$lib/config';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import SocialMediaTags from './SocialMetaTags.svelte';
	import VaultPageHeader from './VaultPageHeader.svelte';
	import ChartWithFeaturedMetrics from './ChartWithFeaturedMetrics.svelte';
	// Vault protocols do not report useful utilisation data.
	// import VaultUtilisationChart from '$lib/top-vaults/VaultUtilisationChart.svelte';
	import VaultMetrics from './VaultMetrics.svelte';
	import VaultTechnicalDetailsTable from './VaultTechnicalDetailsTable.svelte';
	import VaultPeriodicMetrics from './VaultPeriodicMetrics.svelte';
	import VaultCuratorInfo from './VaultCuratorInfo.svelte';
	import VaultProtocolInfo from './VaultProtocolInfo.svelte';
	import VaultRankings from './VaultRankings.svelte';
	import Core3Ratings from '$lib/top-vaults/Core3Ratings.svelte';
	import IconDiscord from '~icons/local/discord';
	import { getMorphoFlags, hasSupportedProtocol, isBlacklisted } from '$lib/top-vaults/helpers';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';

	let { data } = $props();
	let { vault, chain, protocolMetadata, curatorMetadata, stablecoinMetadata, generated_at, core3 } = $derived(data);
	let morphoFlags = $derived(getMorphoFlags(vault));
	let notesDuplicateMorphoFlags = $derived(
		morphoFlags.length > 0 && vault.notes?.startsWith('Morpho has flagged this vault with the following issues:')
	);
	let blacklisted = $derived(isBlacklisted(vault));
	let morphoAlertStatus = $derived(blacklisted ? ('error' as const) : ('warning' as const));
	let showBlacklistedAlert = $derived(blacklisted && !notesDuplicateMorphoFlags);
	let showNotes = $derived(vault.notes != null && !notesDuplicateMorphoFlags);
	let depositMayBeDisabled = $derived(vault.deposit_closed_reason != null);
	let redemptionMayBeDisabled = $derived(vault.redemption_closed_reason != null);
	let operationWarning = $derived(
		depositMayBeDisabled && redemptionMayBeDisabled
			? 'Deposits and withdrawals may be disabled for this vault'
			: depositMayBeDisabled
				? 'Deposits may be disabled for this vault'
				: redemptionMayBeDisabled
					? 'Withdrawals may be disabled for this vault'
					: undefined
	);
</script>

<SocialMediaTags {vault} {chain} {protocolMetadata} />

<main class="vault-details ds-3">
	<Section tag="header" padding="xs">
		<VaultListingsSelector />
	</Section>

	{#if operationWarning}
		<Section padding="md">
			<Alert size="md" status="warning">{operationWarning}</Alert>
		</Section>
	{/if}

	{#if morphoFlags.length > 0}
		<Section padding="md">
			<Alert size="md" status={morphoAlertStatus} title="Morpho has flagged this vault">
				{morphoFlags.join(', ')}
			</Alert>
		</Section>
	{/if}

	<VaultPageHeader {vault} />

	<Section padding="md" --section-gap="var(--gap)">
		{#if showBlacklistedAlert}
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

		<VaultRankings {vault} {chain} {protocolMetadata} />

		<ChartWithFeaturedMetrics
			{vault}
			protocolLogoUrl={protocolMetadata ? getVaultProtocolLogoUrl(protocolMetadata.slug) : undefined}
		/>

		<!-- Vault protocols do not report useful utilisation data.
		<VaultUtilisationChart {vault} />
		-->

		<VaultMetrics {vault} />

		{#if vault.description}
			<MetricsBox class="description" title="About the vault">
				<Markdown content={vault.description} />
			</MetricsBox>
		{/if}

		{#if showNotes && vault.notes}
			<MetricsBox class="notes" title="Notes">
				<Markdown content={vault.notes} />
			</MetricsBox>
		{/if}

		{#if curatorMetadata}
			<VaultCuratorInfo curator={curatorMetadata} />
		{/if}

		{#if protocolMetadata}
			<VaultProtocolInfo {vault} {protocolMetadata} />
		{/if}

		<VaultPeriodicMetrics {vault} {chain} />

		{#if core3}
			<Core3Ratings {core3} protocolName={vault.protocol} protocolSlug={vault.protocol_slug} context="vault" />
		{/if}

		<VaultTechnicalDetailsTable {vault} {chain} {stablecoinMetadata} {generated_at} />
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

	:global(:is(.description, .notes)) {
		color: var(--c-text-extra-light);

		:global(.markdown :is(h1, h2, h3)) {
			font: var(--f-heading-xs-medium);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-extra-light);
			margin-block: 1.5rem 1rem;

			@media (--viewport-sm-down) {
				font-size: 0.875rem;
			}
		}
	}
</style>
