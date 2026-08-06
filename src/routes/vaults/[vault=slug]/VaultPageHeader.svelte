<!--
@component
Displays a vault's heading, external link, update action, and important operational warnings.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import UpdateInfoButton from '$lib/top-vaults/UpdateInfoButton.svelte';
	import {
		getVaultProtocolDisplayName,
		hasSupportedProtocol,
		isVaultTvlDownMoreThan95Percent
	} from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let externalSiteName = $derived.by(() => {
		if (hasSupportedProtocol(vault)) return getVaultProtocolDisplayName(vault);
		if (vault.link) return new URL(vault.link).host;
	});
	let hideCtaOnMobile = $derived(externalSiteName === 'Ostium');
	let showTvlWarning = $derived(isVaultTvlDownMoreThan95Percent(vault));
</script>

<PageHeader>
	{#snippet title()}
		<span class="page-title">
			<span>{vault.name}</span>
		</span>
	{/snippet}

	{#snippet cta()}
		<span class="cta-actions" class:mobile-hidden={hideCtaOnMobile}>
			{#if vault.link}
				<Button href={vault.link} target="_blank" rel="noreferrer">
					{externalSiteName === 'Ostium' ? 'Open vault on Ostium' : `View on ${externalSiteName}`}
				</Button>
			{/if}
			<UpdateInfoButton size="md" />
		</span>
	{/snippet}
</PageHeader>

{#if showTvlWarning}
	<div class="vault-tvl-warning ds-container">
		<Alert size="md" status="warning">
			The value in this vault is down more than 95% of its peak. The vault is likely abandoned or facing issues.
		</Alert>
	</div>
{/if}

{#if vault.flags.includes('long_duration')}
	<div class="long-duration-warning ds-container">
		<Alert size="md" status="error">
			This vault may have especially long duration redemption periods. Make sure you check the redemptions before
			depositing.
		</Alert>
	</div>
{/if}

{#if vault.short_description}
	<p class="vault-description ds-container">{vault.short_description}</p>
{/if}

<style>
	.cta-actions {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;

		&.mobile-hidden {
			@media (--viewport-sm-down) {
				display: none;
			}
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

	.vault-tvl-warning {
		margin-top: var(--space-md);
	}

	.long-duration-warning {
		margin-top: var(--space-md);
	}

	.page-title {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25em;
		align-items: center;
	}
</style>
