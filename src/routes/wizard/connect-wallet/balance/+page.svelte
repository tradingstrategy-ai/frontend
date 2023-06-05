<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';

	wizard.complete('balance');
</script>

<WalletBalance {wizard} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="success" disabled={!$wizard.completed.has('balance')} />
</WizardActions>
