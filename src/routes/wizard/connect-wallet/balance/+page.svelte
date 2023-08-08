<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import { WalletBalance } from '$lib/wallet';

	let retrievedBalanceCount = 0;

	$: wizard.toggleComplete('balance', retrievedBalanceCount === 2);
</script>

<WalletBalance contracts={$wizard.data.contracts} on:dataFetch={() => retrievedBalanceCount++} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="success" disabled={!$wizard.completed.has('balance')} />
</WizardActions>
