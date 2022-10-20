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
	> providing <a class="nowrap" href="/trading-view/trading-pairs">{formatDollar(numbers.liquidity)} liquidity</a>
	across <a class="nowrap" href="/trading-view/blockchains">{numbers.blockchains} blockchains</a>
</div>
<!-- prettier-ignore-end -->

<style lang="postcss">
	div {
		font: var(--f-h3-roman);

		/* toggle white-space setting when longest line no longer fits (adjust width if needed) */
		@media (width >= 768px) {
			white-space: pre-line;
			text-align: center;
		}
	}

	a {
		border-bottom: 2px solid currentColor;
		font-weight: 600;

		&.nowrap {
			white-space: nowrap;
		}
	}
</style>
