<script>
	import { Breadcrumb } from 'trade-executor-frontend';
</script>

<div class="container">
	<Breadcrumb />
</div>

<slot />

<style global>
	/* Price action and candle colors */
	.profit-green {
		color: var(--c-bullish);
	}

	.profit-red {
		color: var(--c-bearish);
	}
</style>
