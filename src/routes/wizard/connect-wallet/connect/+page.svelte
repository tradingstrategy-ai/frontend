<script lang="ts">
	import type { ConfiguredChainId } from '$lib/wallet/client';
	import { wizard } from 'wizard/store';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	$: chainId = $wizard.data.chainId as ConfiguredChainId;

	$: wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chainId);
</script>

<ConnectWallet {chainId} />
