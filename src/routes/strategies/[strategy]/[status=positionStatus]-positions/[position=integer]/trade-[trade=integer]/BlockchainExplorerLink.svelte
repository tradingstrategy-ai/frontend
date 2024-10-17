<script lang="ts">
	import { type Chain, getExplorerUrl } from '$lib/helpers/chain';

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

<style>
	a {
		font: inherit;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
