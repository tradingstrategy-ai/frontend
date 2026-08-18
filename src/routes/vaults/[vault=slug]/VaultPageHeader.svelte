<!--
@component
Displays a vault's heading, external link, update action, and description.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import Button from '$lib/components/Button.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import UpdateInfoButton from '$lib/top-vaults/UpdateInfoButton.svelte';
	import { getVaultProtocolDisplayName, hasSupportedProtocol } from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	const FIRA_HOSTNAME = 'app.fira.money';
	const FIRA_VAULT_SLUG = 'vi-usdc-qa-g';
	const FIRA_VAULT_URL = 'https://app.fira.money/market/busd0-usd0?type=variable';

	// The public top-vaults feed temporarily still provides the retired Euler Earn URL for this vault.
	// Keep this override local to the outbound CTA, rather than changing the vault's Euler protocol classification.
	// Remove it when the feed permanently serves FIRA_VAULT_URL for FIRA_VAULT_SLUG.
	let externalVaultUrl = $derived(vault.vault_slug === FIRA_VAULT_SLUG ? FIRA_VAULT_URL : vault.link);

	let externalSiteName = $derived.by(() => {
		// Fira hosts the live market UI for a migrated Euler vault.
		// The vault must remain categorised as Euler, so do not change its protocol metadata.
		// This presentation-only exception makes the call to action describe where it actually goes.
		if (externalVaultUrl && new URL(externalVaultUrl).hostname === FIRA_HOSTNAME) return 'Fira';

		// Other supported vaults continue to use their protocol name in the call to action.
		if (hasSupportedProtocol(vault)) return getVaultProtocolDisplayName(vault);

		// Unknown-protocol vaults fall back to the hostname of their external destination.
		if (externalVaultUrl) return new URL(externalVaultUrl).host;
	});
</script>

<PageHeader>
	{#snippet title()}
		<span class="page-title">
			<span>{vault.name}</span>
		</span>
	{/snippet}

	{#snippet cta()}
		<span class="cta-actions">
			{#if externalVaultUrl}
				<Button href={externalVaultUrl} target="_blank" rel="noreferrer">
					{externalSiteName === 'Ostium' ? 'Open vault on Ostium' : `View on ${externalSiteName}`}
				</Button>
			{/if}
			<UpdateInfoButton size="md" />
		</span>
	{/snippet}
</PageHeader>

{#if vault.short_description}
	<p class="vault-description ds-container">{vault.short_description}</p>
{/if}

<style>
	.cta-actions {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;

		@media (--viewport-sm-down) {
			display: none;
		}
	}

	.vault-description {
		margin: 0;
		font: var(--f-ui-lg-roman);
		color: var(--c-text-light);

		@media (--viewport-md-up) {
			margin-top: 1rem;
		}
	}

	.page-title {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25em;
		align-items: center;

		@media (--viewport-sm-down) {
			font: var(--f-h2-medium);
		}
	}
</style>
