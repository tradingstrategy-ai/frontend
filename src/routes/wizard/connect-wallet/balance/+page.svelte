<script lang="ts">
	import wizard from '../store';
	import { WalletBalance } from '$lib/wallet';

	let retrievedBalanceCount = 0;

	$: wizard.toggleComplete('balance', retrievedBalanceCount === 2);
</script>

<WalletBalance contracts={$wizard.data.contracts} on:dataFetch={() => retrievedBalanceCount++} />
