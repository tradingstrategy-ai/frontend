<script lang="ts">
	import wizard from '../store';
	import { wallet } from '$lib/wallet/client';
	import { fetchBalance } from '@wagmi/core';
	import { getAccountNetValue } from '$lib/eth-defi/enzyme';
	import { Button, DataBox, Grid, WizardActions } from '$lib/components';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';

	$: ({ contracts, strategyName } = $wizard.data);
</script>

<Grid cols={2} gap="lg">
	<DataBox label="Number of shares">
		<TokenBalance data={fetchBalance({ token: contracts.vault, address: $wallet.address })} />
	</DataBox>

	<DataBox label="Value of shares">
		<TokenBalance data={getAccountNetValue(contracts, $wallet.address)} />
	</DataBox>

	<p style:grid-column="1 / -1">
		Congratulations! You've successfully invested in <strong>{strategyName}</strong>. Keep an eye on your progress and
		returns. Please remember that investing in crypto / DeFi trading strategies carries significant risk. Click "Done"
		to return to the strategy.
	</p>
</Grid>

<WizardActions>
	<Button secondary label="Back" href="payment" />
	<Button label="Done" href={$wizard.returnTo} />
</WizardActions>
