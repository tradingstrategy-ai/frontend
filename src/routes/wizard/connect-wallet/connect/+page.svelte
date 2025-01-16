<script lang="ts">
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';
	import { getChain } from '$lib/helpers/chain.js';

	const { data } = $props();
	const { wizard } = data;
	const { chainId } = $wizard.data;

	$effect(() => {
		wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chainId);
	});
</script>

<ConnectWallet chain={getChain(chainId)!} />
