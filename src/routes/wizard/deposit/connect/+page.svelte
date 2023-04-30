<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	export let data;
</script>

<ConnectWallet chains={data.chains} />

<WizardActions>
	<Button ghost href={$wizard?.returnTo}>Cancel</Button>
	<Button secondary href="introduction">Back</Button>
	<Button href="balance">Next</Button>
</WizardActions>
