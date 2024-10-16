<script lang="ts">
	import type { DepositWizardData } from '../+layout';
	import { wizard } from 'wizard/store';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	const { chainId } = $wizard.data as DepositWizardData;

	$: wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chainId);
</script>

<ConnectWallet {chainId} />
