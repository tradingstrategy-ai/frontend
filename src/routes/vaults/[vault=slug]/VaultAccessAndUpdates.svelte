<!--
@component
Provides the vault's deposit venue and a Discord contact for information updates.

@example

```svelte
	<VaultAccessAndUpdates {vault} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import Button from '$lib/components/Button.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { discordUrl } from '$lib/config';
	import { getVaultProtocolDisplayName, isUnknownVaultProtocol } from '$lib/top-vaults/helpers';

	let { vault }: { vault: VaultInfo } = $props();

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
		if (!isUnknownVaultProtocol(vault)) return getVaultProtocolDisplayName(vault);

		// Unknown-protocol vaults fall back to the hostname of their external destination.
		if (externalVaultUrl) return new URL(externalVaultUrl).host;
	});
</script>

<MetricsBox title="Access and updates">
	<div class="access-and-updates" class:has-venue={!!externalVaultUrl}>
		{#if externalVaultUrl}
			<div class="action">
				<p>You can deposit to this vault on {externalSiteName}.</p>
				<Button href={externalVaultUrl} target="_blank" rel="noreferrer">View on {externalSiteName}</Button>
			</div>
		{/if}
		<div class="action">
			<p>If any information is incorrect or needs updating, contact the Trading Strategy team.</p>
			<Button secondary href={discordUrl} target="_blank" rel="noreferrer">Contact on Discord</Button>
		</div>
	</div>
</MetricsBox>

<style>
	.access-and-updates {
		display: grid;
		gap: var(--space-xl);

		@media (--viewport-sm-up) {
			&.has-venue {
				grid-template-columns: repeat(2, minmax(0, 1fr));
				gap: 0;

				.action:first-child {
					padding-right: var(--space-xl);
				}

				.action + .action {
					border-left: 1px solid var(--c-box-3);
					padding-left: var(--space-xl);
				}
			}
		}
	}

	.action {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-md);
	}

	p {
		flex: 1;
		margin: 0;
		color: var(--c-text-light);
	}
</style>
