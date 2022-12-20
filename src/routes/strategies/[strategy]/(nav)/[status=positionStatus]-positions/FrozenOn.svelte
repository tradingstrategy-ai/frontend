<script lang="ts">
	export let value: 'buy' | 'sell';
</script>

<span class="frozen-on {value}">
	{value}
</span>

<style lang="postcss">
	.frozen-on {
		display: inline-flex;
		gap: 0.5ex;
		text-transform: capitalize;
	}

	.buy {
		color: var(--c-bullish);

		&::before {
			content: '▲';
		}
	}

	.sell {
		color: var(--c-bearish);

		&::before {
			content: '▼';
		}
	}
</style>
