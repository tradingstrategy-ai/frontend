<script lang="ts">
	import wizard from '../store';
	import { wallet, ConnectWallet } from '$lib/wallet';
	import { Button, WizardActions } from '$lib/components';

	export let data;

	$: chains = data.chains;
	$: chainId = $wizard?.data.chainId;

	$: if ($wallet.status === 'connected' && (!chainId || chainId === $wallet.chain?.id)) {
		wizard.complete('connect');
	}
</script>

<ConnectWallet {chainId} {chains} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="introduction" />
	<Button label="Next" href="balance" disabled={!$wizard.completed.has('connect')} />
</WizardActions>
