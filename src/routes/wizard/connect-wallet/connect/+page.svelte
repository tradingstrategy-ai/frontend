<script lang="ts">
	import { Button, WizardActions } from '$lib/components';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';
</script>

<ConnectWallet />

<WizardActions>
	<Button ghost>Cancel</Button>
	<Button secondary href="introduction">Back</Button>
	<Button href="balance">Next</Button>
</WizardActions>
