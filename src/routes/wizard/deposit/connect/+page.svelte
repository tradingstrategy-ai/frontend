<script lang="ts">
	import { wallet, ConnectWallet } from '$lib/wallet';
	import { Button, WizardActions } from '$lib/components';

	export let data;

	$: ({ chains, wizard } = data);
	$: chainId = $wizard?.data.chainId;

	$: if ($wallet.status === 'connected' && $wallet.chain?.id === chainId) {
		wizard.toggleComplete('connect');
	}
</script>

<ConnectWallet {chainId} {chains} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="introduction" />
	<Button label="Next" href="balance" disabled={!$wizard.completed.has('connect')} />
</WizardActions>
