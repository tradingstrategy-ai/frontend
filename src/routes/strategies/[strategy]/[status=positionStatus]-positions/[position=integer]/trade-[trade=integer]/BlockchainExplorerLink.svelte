<script lang="ts">
	import { type Chain, getExplorerUrl } from '$lib/helpers/chain';

	interface Props {
		chain: Chain;
		tx_hash: Address;
	}
	let { chain, tx_hash }: Props = $props();

	let href = $derived(getExplorerUrl(chain, tx_hash));
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
