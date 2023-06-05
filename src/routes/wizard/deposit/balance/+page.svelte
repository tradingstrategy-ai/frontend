<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';

	$: ({ nativeCurrency, denominationToken } = $wizard.data);
	$: if (nativeCurrency?.value > 0n && denominationToken?.value > 0n) {
		wizard.complete('balance');
	}
</script>

<WalletBalance {wizard} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="payment" disabled={!$wizard.completed.has('balance')} />
</WizardActions>
