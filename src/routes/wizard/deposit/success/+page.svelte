<script lang="ts">
	import type { DepositWizardData } from '../+layout';
	import { wizard } from 'wizard/store';
	import { wallet, VaultBalance } from '$lib/wallet';
	import { Grid } from '$lib/components';

	const { contracts, strategyName } = $wizard.data as DepositWizardData;

	$: address = $wallet.address!;
</script>

<Grid gap="lg">
	<VaultBalance {contracts} {address} />

	<p>
		Congratulations! You've successfully deposited in <strong>{strategyName}</strong>. Keep an eye on your progress and
		returns. Please remember that participating in crypto / DeFi trading strategies carries significant risk. Click
		"Done" to return to the strategy.
	</p>
</Grid>
