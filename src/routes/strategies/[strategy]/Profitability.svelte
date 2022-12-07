<script lang="ts">
	import { formatProfitability } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitColourClass } from 'trade-executor-frontend/helpers/profit';

	export let value: number;
</script>

<span class={determineProfitColourClass(value)}>{formatProfitability(value)}</span>

<style>
	.profit-green {
		color: var(--c-bullish);
	}

	.profit-red {
		color: var(--c-bearish);
	}
</style>
