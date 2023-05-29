<script>
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
	import DepositStatus from '$lib/redeem/DepositStatus.svelte';
</script>

<DepositStatus />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} slot="cancel" />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="shares-redemption" on:click={() => wizard.complete('deposit-status')} />
</WizardActions>
