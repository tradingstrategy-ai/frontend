<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';
</script>

<WalletBalance {wizard} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="success" on:click={() => wizard.complete('balance')} />
</WizardActions>
