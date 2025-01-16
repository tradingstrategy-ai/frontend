<script lang="ts">
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	const { data } = $props();
	const { wizard, chain } = data;

	$effect(() => {
		wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chain.id);
	});
</script>

<ConnectWallet {chain} />
