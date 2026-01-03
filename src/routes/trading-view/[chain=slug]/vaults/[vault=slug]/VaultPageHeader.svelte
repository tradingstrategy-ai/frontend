<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { Chain } from '$lib/helpers/chain';
	import Button from '$lib/components/Button.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
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
			{#each vault.flags as flag (flag)}
				<DataBadge class="badge" status="warning">{flag}</DataBadge>
			{/each}
		</span>
	{/snippet}

	{#snippet cta()}
		{#if vault.link}
			<Button href={vault.link} target="_blank" rel="noreferrer">
				View on {externalSiteName}
			</Button>
		{/if}
	{/snippet}
</PageHeader>

<style>
	.page-title {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25em;
		align-items: center;

		:global(.badge) {
			font: var(--f-ui-lg-bold);
			letter-spacing: var(--ls-ui-lg, normal);
		}
	}
</style>
