<script>
	import wizard from '../../wizardState';
	import { Button, DepositStatus, WizardActions } from '$lib/components';
</script>

<div class="deposit-status">
	<DepositStatus />
</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="shares-redemption" on:click={() => wizard.complete('deposit-status')} />
</WizardActions>
