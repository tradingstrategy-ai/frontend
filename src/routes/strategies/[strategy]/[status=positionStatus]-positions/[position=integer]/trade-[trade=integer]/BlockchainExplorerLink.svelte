<script lang="ts">
	import type { Chain } from 'viem';
	import { getExplorerUrl } from '$lib/helpers/chain';

	export let chain: Chain;
	export let tx_hash: Address;

	$: href = getExplorerUrl(chain, tx_hash);
</script>

{#if href}
	<a target="_blank" rel="noreferrer" {href}>
		{tx_hash}
	</a>
{:else}
	{tx_hash}
{/if}

<style lang="postcss">
	a {
		font: inherit;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
