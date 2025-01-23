<script lang="ts">
	import type { VaultOnChainData } from 'trade-executor/schemas/summary';
	import { wallet } from '$lib/wallet/client';
	import { Grid } from '$lib/components';
	import VaultBalance from '$lib/wallet/VaultBalance.svelte';

	let { data } = $props();
	const { strategy } = data;

	const onChainData = strategy.on_chain_data as VaultOnChainData;
</script>

<Grid gap="lg">
	<VaultBalance {onChainData} address={$wallet.address!} />

	<p>
		Congratulations! You've successfully deposited in <strong>{strategy.name}</strong>. Keep an eye on your progress and
		returns. Please remember that participating in crypto / DeFi trading strategies carries significant risk. Click
		"Done" to return to the strategy.
	</p>
</Grid>
