<!--
@component
Display summary performance data for a given period; lazy-loads data when scrolled into view.

#### Usage:
```tsx
	<TimePeriodSummaryColumn
		pairId={1234}
		hideLiquidityAndTrades={true|false}
		period="hourly|daily|weekly|monthly"
		active={true|false}
	/>
```
-->
<script lang="ts">
	import { backendUrl } from '$lib/config';
	import { inview } from 'svelte-inview';
	import { formatDollar, formatAmount, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let pairId: number | string;
	export let hideLiquidityAndTrades = false;
	export let period: string;
	export let active = false;

	let loaded = false;
	let tradeData: any = {};
	let priceChangeClass = '';

	$: if (pairId) {
		loaded = false;
		tradeData = {};
	}

	$: skeleton = !loaded;
	$: priceChangeClass = determinePriceChangeClass(getPriceChange(tradeData));

	async function loadData() {
		const params = new URLSearchParams({ pair_id: pairId, period });

		// see: https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
		const apiUrl = `${backendUrl}/pair-trade-data?${params}`;

		const resp = await fetch(apiUrl);
		if (!resp.ok) {
			console.error(resp);
			return;
		}

		loaded = true;
		tradeData = await resp.json();
	}

	function getPriceChange({ price_close = 0, price_open = 0 }) {
		return price_close - price_open;
	}
</script>

<div class="time-period-col" class:active class:loading={!loaded}>
	<!-- inview beacon must be nested in conditional block so it resets when pairId changes -->
	{#if !loaded}
		<span use:inview={{ rootMargin: '100px' }} on:enter={loadData} />
	{/if}
	<ul>
		<li class="col-heading {priceChangeClass}">
			{period}
		</li>
		<li class={priceChangeClass} class:skeleton>
			{formatPriceChange(tradeData.price_close / tradeData.price_open - 1)}
		</li>
		<li class:skeleton>
			<!-- coercing 0 values to null in order to render "---" fallback -->
			{formatDollar(tradeData.price_open || null)}
		</li>
		<li class:skeleton>
			{formatDollar(tradeData.price_high || null)}
		</li>
		<li class:skeleton>
			{formatDollar(tradeData.price_low || null)}
		</li>
		<li class:skeleton>
			{formatDollar(tradeData.price_close || null)}
		</li>
		<li class:skeleton style:--skeleton-width="7ch">
			{formatDollar(tradeData.volume || null)}
		</li>
		{#if !hideLiquidityAndTrades}
			<li class:skeleton style:--skeleton-width="7ch">
				{formatDollar(tradeData.liquidity_high || null)}
			</li>
			<li class:skeleton style:--skeleton-width="7ch">
				{formatDollar(tradeData.liquidity_low || null)}
			</li>
			<li class:skeleton>
				{formatAmount(tradeData.buys)}
			</li>
			<li class:skeleton>
				{formatAmount(tradeData.sells)}
			</li>
		{/if}
	</ul>
</div>

<!--
NOTE: styles inherited from parent component TimePeriodSummaryTable
-->
