<script lang="ts">
	import type { ConnectWizardData } from '../+layout';
	import { wizard } from 'wizard/store';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	const { chain } = $wizard.data as ConnectWizardData;

	$: wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chain.id);
</script>

<ConnectWallet {chain} />
