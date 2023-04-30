<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
	import WalletDeposit from '$lib/wallet/WalletDeposit.svelte';
</script>

<WalletDeposit />

<WizardActions>
	<Button ghost href={$wizard?.returnTo}>Cancel</Button>
	<Button secondary href="balance">Back</Button>
	<Button href="success">Next</Button>
</WizardActions>
