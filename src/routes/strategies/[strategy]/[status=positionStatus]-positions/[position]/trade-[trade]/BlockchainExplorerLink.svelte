<script lang="ts">
	import { getBlockchainExplorerLink } from 'trade-executor-frontend/helpers/chain-explorer';

	export let chain_id: number;
	export let tx_hash: string;
</script>

<a target="_blank" href={getBlockchainExplorerLink(chain_id, tx_hash)}>
	{tx_hash}
</a>

<style lang="postcss">
	a {
		font: inherit;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
