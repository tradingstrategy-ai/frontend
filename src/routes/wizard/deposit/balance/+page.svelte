<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';
</script>

<WalletBalance />

<WizardActions>
	<Button ghost href={$wizard?.returnTo}>Cancel</Button>
	<Button secondary href="connect">Back</Button>
	<Button href="payment">Next</Button>
</WizardActions>
