<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	let { data } = $props();
	let { chain } = $derived(data);
	const wizard = getWizardContext();

	$effect(() => {
		wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chain.id);
	});
</script>

<ConnectWallet {chain} />
