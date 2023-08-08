<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import { WalletBalance } from '$lib/wallet';

	wizard.toggleComplete('balance');
</script>

<WalletBalance contracts={$wizard.data.contracts} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="success" disabled={!$wizard.completed.has('balance')} />
</WizardActions>
