<script lang="ts">
	let { data } = $props();
	const { wizard } = data;
</script>

<div class="connect-wallet-success">
	<p>
		Congratulations! You have successfully connected your wallet to Trading Strategy. You can now deposit funds in
		<strong>{$wizard.data.strategyName}</strong> and other strategies. Click "Done" to return to the strategy overview. Happy
		trading!
	</p>
</div>
