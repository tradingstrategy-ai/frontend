<script lang="ts">
	import type { DepositWizardData } from '../+layout';
	import { wizard } from 'wizard/store';
	import { wallet, ConnectWallet } from '$lib/wallet';

	const { chainId } = $wizard.data as DepositWizardData;

	$: wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chainId);
</script>

<ConnectWallet {chainId} />
