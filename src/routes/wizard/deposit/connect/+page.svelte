<script lang="ts">
	import wizard from '../store';
	import { wallet } from '$lib/wallet/client';
	import { Button, WizardActions } from '$lib/components';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	export let data;

	$: chains = data.chains;
	$: chainId = $wizard?.data.chainId;

	$: if ($wallet.status === 'connected' && $wallet.chain?.id === chainId) {
		wizard.complete('connect');
	}
</script>

<ConnectWallet {chainId} {chains} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="introduction" />
	<Button label="Next" href="balance" disabled={!$wizard.completed.has('connect')} />
</WizardActions>
