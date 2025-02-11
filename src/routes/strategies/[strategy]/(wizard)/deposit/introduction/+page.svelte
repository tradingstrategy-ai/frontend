<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte';

	const { data } = $props();
	const { strategy, denominationTokenInfo } = data;
	const wizard = getWizardContext();

	wizard.toggleComplete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to deposit in <strong>{strategy.name}</strong>? Deposit <strong>{denominationTokenInfo.label}</strong> to add this
		strategy to your DeFi trading portfolio. Connect your wallet, review your balances, enter your desired deposit amount,
		and make your payment. Let's get started!
	</p>
</div>
