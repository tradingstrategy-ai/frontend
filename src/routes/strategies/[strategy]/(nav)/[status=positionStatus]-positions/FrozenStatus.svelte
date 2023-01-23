<script lang="ts">
	export let lastTradeQuantity: number;
	$: status = lastTradeQuantity > 0 ? 'buy' : 'sell';
</script>

<span class="frozen-status {status}">
	{status}
</span>

<style lang="postcss">
	.frozen-status {
		display: inline-flex;
		gap: 0.5ex;
		text-transform: capitalize;
	}

	.buy {
		color: hsla(var(--hsl-bullish));

		&::before {
			content: '▲';
		}
	}

	.sell {
		color: hsla(var(--hsl-bearish));

		&::before {
			content: '▼';
		}
	}
</style>
