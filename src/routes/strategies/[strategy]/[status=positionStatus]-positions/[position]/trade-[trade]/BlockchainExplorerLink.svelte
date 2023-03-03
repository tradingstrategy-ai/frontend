<script lang="ts">
	import { getChainExplorerLink } from 'trade-executor-frontend/helpers/chain-explorer';

	export let chain_id: number;
	export let tx_hash: string;

	$: href = getChainExplorerLink(chain_id, tx_hash);
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
