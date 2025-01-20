<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte.js';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	const wizard = getWizardContext();

	const { data } = $props();
	const { chain } = data;

	$effect(() => {
		wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chain.id);
	});
</script>

<ConnectWallet {chain} />
