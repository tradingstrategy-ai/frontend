<script lang="ts">
	import { wallet, config } from '$lib/wallet/client';
	import { Grid } from '$lib/components';
	import ShareBalances from '$lib/wallet/ShareBalances.svelte';

	let { data } = $props();
	const { strategy, vault } = data;
</script>

<Grid gap="lg">
	<ShareBalances
		shares={vault.getShareBalance(config, $wallet.address!)}
		value={vault.getShareValueUSD(config, $wallet.address!)}
	/>

	<p>
		Congratulations! You've successfully deposited in <strong>{strategy.name}</strong>. Keep an eye on your progress and
		returns. Please remember that participating in crypto / DeFi trading strategies carries significant risk. Click
		"Done" to return to the strategy.
	</p>
</Grid>
