<script lang="ts">
	import { Button, WizardActions } from '$lib/components';
	import WalletDeposit from '$lib/wallet/WalletDeposit.svelte';
</script>

<WalletDeposit />

<WizardActions>
	<Button ghost>Cancel</Button>
	<Button secondary href="balance">Back</Button>
	<Button href="success">Next</Button>
</WizardActions>
