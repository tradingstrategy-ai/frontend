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
		--profit-green: #458b00;
		--profit-red: #cc0000;
		--profit-black: #000;
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
