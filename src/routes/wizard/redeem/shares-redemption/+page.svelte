<script>
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="shares-redemption">Shares redemption</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button secondary label="Back" href="deposit-status" />
	<Button label="Next" href="success" on:click={() => wizard.complete('shares-redemption')} />
</WizardActions>
