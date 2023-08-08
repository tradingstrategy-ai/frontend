<script lang="ts">
	import wizard from '../store';
	import { wallet, ConnectWallet } from '$lib/wallet';

	export let data;

	$: chains = data.chains;
	$: chainId = $wizard?.data.chainId;

	$: wizard.toggleComplete('connect', $wallet.status === 'connected' && $wallet.chain?.id === chainId);
</script>

<ConnectWallet {chainId} {chains} />
