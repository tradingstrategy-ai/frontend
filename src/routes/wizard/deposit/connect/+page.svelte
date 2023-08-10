<script lang="ts">
	import { wizard } from 'wizard/store';
	import { wallet, ConnectWallet } from '$lib/wallet';

	export let data;

	$: chainId = $wizard?.data.chainId;

	$: wizard.toggleComplete('connect', $wallet.status === 'connected' && $wallet.chain?.id === chainId);
</script>

<ConnectWallet {chainId} chains={data.chains} />
