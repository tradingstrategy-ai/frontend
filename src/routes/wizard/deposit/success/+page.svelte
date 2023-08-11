<script lang="ts">
	import { wizard } from 'wizard/store';
	import { wallet, VaultBalance } from '$lib/wallet';
	import { Grid } from '$lib/components';

	$: ({ contracts, strategyName } = $wizard.data);
	$: address = $wallet.address!;
</script>

<Grid gap="lg">
	<VaultBalance {contracts} {address} />

	<p>
		Congratulations! You've successfully invested in <strong>{strategyName}</strong>. Keep an eye on your progress and
		returns. Please remember that investing in crypto / DeFi trading strategies carries significant risk. Click "Done"
		to return to the strategy.
	</p>
</Grid>
