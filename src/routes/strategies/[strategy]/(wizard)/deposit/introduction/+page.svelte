<script lang="ts">
	let { data } = $props();
	const { wizard, strategy, denominationTokenInfo } = data;

	wizard.toggleComplete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to deposit in <strong>{strategy.name}</strong>? Deposit <strong>{denominationTokenInfo.label}</strong> to add this
		strategy to your DeFi trading portfolio. Connect your wallet, review your balances, enter your desired deposit amount,
		and make your payment. Let's get started!
	</p>
</div>
