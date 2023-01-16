<script lang="ts">
	import { formatProfitability } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitColourClass } from 'trade-executor-frontend/helpers/profit';

	export let value: number;
</script>

<span class={determineProfitColourClass(value)}>{formatProfitability(value)}</span>

<style>
	.profit-green {
		color: hsla(var(--hsl-bullish));
	}

	.profit-red {
		color: hsla(var(--hsl-bearish));
	}
</style>
