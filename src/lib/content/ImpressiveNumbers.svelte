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

<!-- preserving text-wrapping on larger display -->
<!-- prettier-ignore-start -->
<div>
	Built upon powerful market data for <a href="/trading-view/blockchains">{numbers.blockchains}&nbsp;blockchains</a>,
	<a href="/trading-view/exchanges">{formatAmount(numbers.exchanges)} decentralised exchanges</a
	>, <a href="/trading-view/trading-pairs">{formatAmount(numbers.pairs)} trading pairs</a>
	and <a href="/trading-view/search">{formatAmount(numbers.tokens)} tokens</a> with <a
		href="/trading-view/trading-pairs">{formatDollar(numbers.liquidity)} liquidity</a>.
</div>
<!-- prettier-ignore-end -->

<style>
	div {
		font: var(--f-h3-roman);
	}

	a {
		border-bottom: 2px solid var(--c-ink);
		font-weight: 600;
	}

	@media (min-width: 900px) {
		div {
			white-space: pre;
		}
	}
</style>
