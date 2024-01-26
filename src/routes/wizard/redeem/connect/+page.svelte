<script lang="ts">
	import { wizard } from 'wizard/store';
	import { wallet, ConnectWallet } from '$lib/wallet';

	export let data;
	$: chainId = $wizard?.data?.chainId;

	$: wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chainId);
</script>

<ConnectWallet {chainId} chainInfo={data.chainInfo} />
