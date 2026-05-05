<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import Button from '$lib/components/Button.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { hasSupportedProtocol } from '$lib/top-vaults/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let externalSiteName = $derived.by(() => {
		if (hasSupportedProtocol(vault)) return vault.protocol;
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
		{#if vault.link}
			<span class="external-link">
				<Button href={vault.link} target="_blank" rel="noreferrer">
					View on {externalSiteName}
				</Button>
			</span>
		{/if}
	{/snippet}
</PageHeader>

{#if vault.short_description}
	<p class="vault-description ds-container">{vault.short_description}</p>
{/if}

<style>
	.external-link {
		@media (--viewport-sm-down) {
			display: none;
		}
	}

	.vault-description {
		margin: 0;
		font: var(--f-ui-lg-roman);
		color: var(--c-text-light);
	}

	.page-title {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25em;
		align-items: center;
	}
</style>
