<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import type { Chain } from '$lib/helpers/chain';

	interface Props {
		showChain: boolean;
		chainId: number;
		chain: Chain | undefined;
		name: string;
		protocol: string;
	}

	let { showChain, chainId, chain, name, protocol }: Props = $props();
</script>

<div class="vault-cell">
	{#if showChain}
		{#if chain}
			<Tooltip>
				<a slot="trigger" href="/trading-view/{chain.slug}">
					<img src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
				</a>
				<svelte:fragment slot="popup">
					{chain.name}
				</svelte:fragment>
			</Tooltip>
		{:else}
			<Tooltip>
				<div slot="trigger" class="no-logo">?</div>
				<svelte:fragment slot="popup">
					Chain {chainId}
				</svelte:fragment>
			</Tooltip>
		{/if}
	{/if}

	<div class="multiline">
		<strong>{name}</strong>
		{#if protocol}
			<span class="protocol">{protocol}</span>
		{/if}
	</div>
</div>

<style>
	.vault-cell {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.625rem;
		align-items: center;
		--logo-size: 1.25rem;

		img {
			width: var(--logo-size);
			height: var(--logo-size);
		}

		.no-logo {
			display: grid;
			place-content: center;
			width: var(--logo-size);
			height: var(--logo-size);
			border-radius: 50%;
			background: var(--c-text-ultra-light);
			cursor: not-allowed;
		}
	}
</style>
