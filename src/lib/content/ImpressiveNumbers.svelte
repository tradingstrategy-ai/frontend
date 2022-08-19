<!--
@component
Frontpage impressive numbers widget. For the API see impressive-numbers:
https://tradingstrategy.ai/api/explorer/

#### Usage:
```tsx
	<ImpressiveNumbers numbers={ImpressiveNumbers} />
```
-->
<script>
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	export let numbers;
</script>

<!-- preserving text-wrapping on larger displays - end lines below at preferred line-breaks -->
<!-- prettier-ignore-start -->
<div>
	Market data and trading strategy framework
	for <a href="/trading-view/trading-pairs">{formatAmount(numbers.pairs)} trading pairs</a
	> providing <a href="/trading-view/trading-pairs">{formatDollar(numbers.liquidity)}&nbsp;liquidity</a>
	across <a href="/trading-view/blockchains">{numbers.blockchains}&nbsp;blockchains</a>
</div>
<!-- prettier-ignore-end -->

<style>
	div {
		font: var(--f-h3-roman);
	}

	a {
		border-bottom: 2px solid currentColor;
		font-weight: 600;
	}

	/* adjust width to toggle white-space setting when longest line no longer fits */
	@media (width >= 800px) {
		div {
			white-space: pre-line;
			text-align: center;
		}
	}
</style>
