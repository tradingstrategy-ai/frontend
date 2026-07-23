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

	let externalSiteName = $derived.by(() => {
		if (hasSupportedProtocol(vault)) return getVaultProtocolDisplayName(vault);
		if (vault.link) return new URL(vault.link).host;
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
			{#if vault.link}
				<Button href={vault.link} target="_blank" rel="noreferrer">
					View on {externalSiteName}
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
	}
</style>
