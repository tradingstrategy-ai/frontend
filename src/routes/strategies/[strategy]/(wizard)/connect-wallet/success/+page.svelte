<script lang="ts">
	const { data } = $props();
	const { strategy } = data;
</script>

<div class="connect-wallet-success">
	<p>
		Congratulations! You have successfully connected your wallet to Trading Strategy. You can now deposit funds in
		<strong>{strategy.name}</strong> and other strategies. Click "Done" to return to the strategy overview. Happy trading!
	</p>
</div>
