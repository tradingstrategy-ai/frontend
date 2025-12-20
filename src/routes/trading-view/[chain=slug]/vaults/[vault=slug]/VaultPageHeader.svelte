<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import Button from '$lib/components/Button.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		vault: VaultInfo;
		chain?: Chain;
	}

	let { vault, chain }: Props = $props();

	let externalSiteName = $derived.by(() => {
		if (!vault.protocol.startsWith('<')) return vault.protocol;
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

	{#snippet subtitle()}
		<span class="subtitle">
			vault on {vault.protocol} on
			<EntitySymbol size="0.875em" label={chain?.name} logoUrl={getLogoUrl('blockchain', chain?.slug)} />
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

	.subtitle {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5ex;
	}
</style>
