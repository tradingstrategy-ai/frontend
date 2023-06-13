<script>
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import { WalletTokenRedemption } from '$lib/wallet';

	wizard.complete('shares-redemption');
</script>

<WalletTokenRedemption />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button secondary label="Back" href="deposit-status" />
	<Button label="Next" href="success" disabled={!$wizard.completed.has('deposit-status')} />
</WizardActions>
