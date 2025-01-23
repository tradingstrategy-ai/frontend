<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte';

	const wizard = getWizardContext();

	wizard.toggleComplete('introduction');
</script>

<div class="connect-wallet-introduction">
	<p>
		Connect your crypto wallet to Trading Strategy in just a few clicks! Choose your preferred wallet application,
		confirm the connection in your wallet, and view your current crypto balances. Let's get started!
	</p>
</div>
