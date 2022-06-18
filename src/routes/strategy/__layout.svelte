<script>
	import { Breadcrumb } from 'trade-executor-frontend';
</script>

<div class="container">
	<Breadcrumb />
</div>

<slot />

<!--

    Styles that are applied to within any page of strategy section.

-->
<style>
	:global(:root) {
		--profit-green: var(--c-bullish-dark);
		--profit-red: var(--c-bearish-dark);
		--profit-black: var(--c-ink);
	}

	/**
     * Price action and candle colors
     */
	:global(.profit-green) {
		color: var(--profit-green);
	}

	:global(.profit-red) {
		color: var(--profit-red);
	}
</style>
