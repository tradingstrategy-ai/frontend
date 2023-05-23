<script lang="ts">
	import wizard from '../store';
	import { wallet } from '$lib/wallet/client';
	import { Button, WizardActions } from '$lib/components';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	export let data;
	$: chains = data.chains;
</script>

<ConnectWallet requestedChainId={$wizard?.data.requestedChainId} {chains} />

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button secondary label="Back" href="introduction" />
	<Button
		label="Next"
		href="balance"
		disabled={$wallet.chain?.id !== $wizard?.data.requestedChainId}
		on:click={() => wizard.complete('connect')}
	/>
</WizardActions>
