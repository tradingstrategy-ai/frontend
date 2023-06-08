<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import WalletDeposit from '$lib/wallet/WalletDeposit.svelte';
</script>

<WalletDeposit {wizard} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} disabled={$wizard.completed.has('payment')} />
	<Button secondary label="Back" href="balance" />
	<Button label="Next" href="success" disabled={!$wizard.completed.has('payment')} />
</WizardActions>
