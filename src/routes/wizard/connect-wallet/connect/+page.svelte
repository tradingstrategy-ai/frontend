<script lang="ts">
	import { Button, WizardActions } from '$lib/components';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	export let data;
</script>

<ConnectWallet chains={data.chains} />

<WizardActions>
	<Button ghost>Cancel</Button>
	<Button secondary href="introduction">Back</Button>
	<Button href="balance">Next</Button>
</WizardActions>
