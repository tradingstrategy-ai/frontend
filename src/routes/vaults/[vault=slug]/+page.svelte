<!--
Vault detail page with performance, protocol, private-deposit, and third-party risk information.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
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
	import XerberusRisk from '$lib/top-vaults/XerberusRisk.svelte';
	import IconDiscord from '~icons/local/discord';
	import {
		getMorphoFlags,
		getVaultProtocolDisplayName,
		hasSupportedProtocol,
		isBlacklisted,
		isVaultDepositCapped,
		isVaultTvlDownMoreThan95Percent
	} from '$lib/top-vaults/helpers';
	import { getCuratorSocialLogoUrl } from '$lib/social-card/helpers';
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
	let isTokenisedFund = $derived(vault.flags.includes('tokenised_fund'));
	let isPrivate = $derived(vault.whitelist?.status === 'whitelisted');
	let isCapped = $derived(isVaultDepositCapped(vault));
	let showTvlWarning = $derived(isVaultTvlDownMoreThan95Percent(vault));
	let showLongDurationWarning = $derived(vault.flags.includes('long_duration'));
	let depositMayBeDisabled = $derived(vault.deposit_closed_reason != null);
	let redemptionMayBeDisabled = $derived(vault.redemption_closed_reason != null);
	let operationWarning = $derived(
		isCapped
			? redemptionMayBeDisabled
				? 'Deposits are capped and withdrawals may be disabled for this vault'
				: 'Deposits are capped for this vault'
			: depositMayBeDisabled && redemptionMayBeDisabled
				? 'Deposits and withdrawals may be disabled for this vault'
				: depositMayBeDisabled
					? 'Deposits may be disabled for this vault'
					: redemptionMayBeDisabled
						? 'Withdrawals may be disabled for this vault'
						: undefined
	);
	let chartLogoUrl = $derived(
		getCuratorSocialLogoUrl(curatorMetadata) ??
			(protocolMetadata ? getVaultProtocolLogoUrl(protocolMetadata.slug) : undefined)
	);
</script>

<SocialMediaTags {vault} {chain} {protocolMetadata} {curatorMetadata} {stablecoinMetadata} />

<main class="vault-details ds-3">
	<Section tag="header" padding="xs">
		<VaultListingsSelector />
	</Section>

	<VaultPageHeader {vault} />

	<Section padding="md" --section-gap="var(--gap)">
		{#if operationWarning || isPrivate || morphoFlags.length > 0 || showTvlWarning || showLongDurationWarning || showBlacklistedAlert || !hasSupportedProtocol(vault)}
			<div class="notification-stack">
				{#if isTokenisedFund && (operationWarning || isPrivate)}
					<Alert size="md" status="info">
						{vault.name} is a tokenised fund. It is smart contract-based, but may not offer all features of vaults.
						<a href={resolve('/glossary/tokenised-fund')}
							>Read more about the differences between vaults and tokenised funds here.</a
						>
					</Alert>
				{:else if operationWarning}
					<Alert size="md" status="warning">{operationWarning}</Alert>
				{/if}

				{#if isPrivate && !isTokenisedFund}
					<Alert size="md" status="warning"
						>This is a permissioned vault and is not accepting deposits from outsiders</Alert
					>
				{/if}

				{#if showTvlWarning}
					<Alert size="md" status="warning">
						The value in this vault is down more than 95% of its peak. The vault is likely abandoned or facing issues.
					</Alert>
				{/if}

				{#if showLongDurationWarning}
					<Alert size="md" status="error">
						This vault may have especially long duration redemption periods. Make sure you check the redemptions before
						depositing.
					</Alert>
				{/if}

				{#if morphoFlags.length > 0}
					<Alert size="md" status={morphoAlertStatus} title="Morpho has flagged this vault">
						{morphoFlags.join(', ')}
					</Alert>
				{/if}

				{#if showBlacklistedAlert}
					<Alert size="md" title="Blacklisted">
						{vault.notes ?? 'Unknown reason'}
					</Alert>
				{/if}

				{#if !hasSupportedProtocol(vault)}
					<Alert size="md" status="warning" title="Protocol not supported">
						<div>
							This protocol is not supported yet. Contact us on Discord for information about how to include new
							protocols.
						</div>
						<Button slot="cta" size="sm" label="Join Discord" href={discordUrl} target="_blank" rel="noreferrer">
							<IconDiscord slot="icon" />
						</Button>
					</Alert>
				{/if}
			</div>
		{/if}

		<VaultRankings {vault} {chain} {protocolMetadata} />

		<ChartWithFeaturedMetrics {vault} {chartLogoUrl} />

		<!-- Vault protocols do not report useful utilisation data.
		<VaultUtilisationChart {vault} />
		-->

		<VaultMetrics {vault} {stablecoinMetadata} />

		<div class="vault-information">
			{#if vault.description}
				<MetricsBox class="description" title="About the vault">
					<Markdown content={vault.description} />
				</MetricsBox>
			{/if}

			{#if curatorMetadata}
				<VaultCuratorInfo {vault} curator={curatorMetadata} />
			{/if}

			{#if protocolMetadata}
				<VaultProtocolInfo {vault} {protocolMetadata} />
			{/if}
		</div>

		{#if vault.xerberus}
			<XerberusRisk xerberus={vault.xerberus} />
		{/if}

		{#if core3}
			<Core3Ratings
				{core3}
				protocolName={getVaultProtocolDisplayName(vault)}
				protocolSlug={vault.protocol_slug}
				context="vault"
			/>
		{/if}

		{#if showNotes && vault.notes}
			<MetricsBox class="notes" title="Notes">
				<Markdown content={vault.notes} />
			</MetricsBox>
		{/if}

		<VaultPeriodicMetrics {vault} {chain} />

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

	.notification-stack {
		display: grid;
		gap: var(--space-md);
	}

	.vault-information {
		display: grid;
		gap: var(--gap);

		@media (--viewport-lg-up) {
			grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
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
