<script lang="ts">
	import wizard from '../store';
	import { wallet } from '$lib/wallet/client';
	import { Button, Grid, WizardActions } from '$lib/components';
	import VaultBalance from '$lib/wallet/VaultBalance.svelte';

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

<WizardActions>
	<Button secondary label="Back" href="payment" />
	<Button label="Done" href={$wizard.returnTo} />
</WizardActions>
