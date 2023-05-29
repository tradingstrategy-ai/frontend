<script>
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
	import WalletTokenRedemption from '$lib/wallet/WalletTokenRedemption.svelte';
</script>

<WalletTokenRedemption />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} slot="cancel" />
	<Button secondary label="Back" href="deposit-status" />
	<Button label="Next" href="success" on:click={() => wizard.complete('shares-redemption')} />
</WizardActions>
