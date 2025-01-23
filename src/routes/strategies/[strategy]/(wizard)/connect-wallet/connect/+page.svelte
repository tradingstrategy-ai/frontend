<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte.js';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	const wizard = getWizardContext();

	const { data } = $props();
	const { chain } = data;

	let isComplete = $derived($wallet.isConnected && $wallet.chainId === chain.id);

	$effect(() => {
		wizard.toggleComplete('connect', isComplete);
	});
</script>

<ConnectWallet {chain} />
