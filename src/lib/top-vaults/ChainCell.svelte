<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { resolve } from '$app/paths';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		chain: Chain | undefined;
		label: string;
	}

	let { chain, label }: Props = $props();
</script>

<div class="chain-cell">
	<Tooltip>
		<svelte:fragment slot="trigger">
			{#if chain}
				<a href={resolve('/trading-view/{chain.slug}/vaults')}>
					<img src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
				</a>
			{:else}
				<div class="no-logo">?</div>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="popup">
			{label}
		</svelte:fragment>
	</Tooltip>
</div>

<style>
	.chain-cell {
		--logo-size: 1.25rem;

		img {
			display: block;
			width: var(--logo-size);
			height: var(--logo-size);
			min-width: var(--logo-size);
			min-height: var(--logo-size);
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

		:global(.popup) {
			white-space: nowrap;
		}
	}
</style>
