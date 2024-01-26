<script lang="ts">
	import { wizard } from 'wizard/store';
	import { WalletBalance } from '$lib/wallet';

	let retrievedBalanceCount = 0;

	const requiredBalances = $wizard.data?.contracts.comptroller ? 2 : 1;

	$: wizard.toggleComplete('balance', retrievedBalanceCount === requiredBalances);
</script>

<WalletBalance contracts={$wizard.data?.contracts} on:dataFetch={() => retrievedBalanceCount++} />
