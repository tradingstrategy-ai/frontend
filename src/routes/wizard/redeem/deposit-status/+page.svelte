<script>
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import DepositStatus from '$lib/redeem/DepositStatus.svelte';

	wizard.complete('deposit-status');
</script>

<DepositStatus {wizard} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="shares-redemption" disabled={!$wizard.completed.has('deposit-status')} />
</WizardActions>
