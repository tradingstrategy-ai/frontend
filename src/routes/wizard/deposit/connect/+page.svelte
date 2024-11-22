<script lang="ts">
	import type { DepositWizardData } from '../+layout';
	import { wizard } from 'wizard/store';
	import { wallet } from '$lib/wallet/client';
	import ConnectWallet from '$lib/wallet/ConnectWallet.svelte';

	const { chain } = $wizard.data as DepositWizardData;

	// svelte-ignore reactive_declaration_non_reactive_property
	$: wizard.toggleComplete('connect', $wallet.isConnected && $wallet.chainId === chain.id);
</script>

<ConnectWallet {chain} />
