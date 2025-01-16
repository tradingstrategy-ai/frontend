<script lang="ts">
	let { data } = $props();
	const { wizard, strategy, denominationToken } = data;

	wizard.updateData({ denominationToken });
	wizard.toggleComplete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to redeem shares of <strong>{strategy.name}</strong>? Upon redemption, you'll receive
		<strong>{denominationToken.label}</strong> and any tokens the strategy is currently invested in. Connect your wallet,
		review your share balance, enter your desired redemption amount, and complete your transaction. Let's get started!
	</p>
</div>
