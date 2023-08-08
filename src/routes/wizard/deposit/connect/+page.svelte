<script lang="ts">
	import { wallet, ConnectWallet } from '$lib/wallet';

	export let data;

	$: ({ chains, wizard } = data);
	$: chainId = $wizard?.data.chainId;

	$: wizard.toggleComplete('connect', $wallet.status === 'connected' && $wallet.chain?.id === chainId);
</script>

<ConnectWallet {chainId} {chains} />
