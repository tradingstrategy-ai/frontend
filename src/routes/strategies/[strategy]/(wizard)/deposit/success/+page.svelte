<script lang="ts">
	import { wallet } from '$lib/wallet/client';
	import { Grid } from '$lib/components';
	import VaultBalance from '$lib/wallet/VaultBalance.svelte';

	let { data } = $props();
	const { strategy, vault } = data;
</script>

<Grid gap="lg">
	<VaultBalance {vault} address={$wallet.address!} />

	<p>
		Congratulations! You've successfully deposited in <strong>{strategy.name}</strong>. Keep an eye on your progress and
		returns. Please remember that participating in crypto / DeFi trading strategies carries significant risk. Click
		"Done" to return to the strategy.
	</p>
</Grid>
