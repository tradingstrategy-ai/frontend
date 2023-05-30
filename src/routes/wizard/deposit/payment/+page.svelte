<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import WalletDeposit from '$lib/wallet/WalletDeposit.svelte';
</script>

<WalletDeposit chainId={$wizard?.data.chainId} contracts={$wizard?.data.contracts} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button secondary label="Back" href="balance" />
	<Button label="Next" href="success" on:click={() => wizard.complete('payment')} />
</WizardActions>
