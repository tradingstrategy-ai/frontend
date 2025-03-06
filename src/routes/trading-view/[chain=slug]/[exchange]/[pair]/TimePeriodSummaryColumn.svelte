<!--
@component
Display summary performance data for a given period; lazy-loads data when scrolled into view.

@example

```svelte
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
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';

	export let pairId: number | string;
	export let hideLiquidityAndTrades = false;
	export let period: string;
	export let active = false;

	let loaded = false;
	let tradeData: any = {};

	$: if (pairId) {
		loaded = false;
		tradeData = {};
	}

	$: skeleton = !loaded;

	$: priceChange = getProfitInfo(getPriceChange(tradeData));

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
		return price_close / price_open - 1;
	}
</script>

<div class="time-period-col" class:active class:loading={!loaded}>
	<!-- inview beacon must be nested in conditional block so it resets when pairId changes -->
	{#if !loaded}
		<span use:inview={{ rootMargin: '100px' }} on:inview_enter={loadData}></span>
	{/if}
	<ul>
		<li class="col-heading {priceChange.directionClass}">
			{period}
		</li>
		<li class="price-change {priceChange.directionClass}" class:skeleton>
			{priceChange}
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

<style>
	/* NOTE: shared ul/li styles inherited from parent component TimePeriodSummaryTable */

	.time-period-col {
		&:not(.active) {
			@media (--viewport-sm-down) {
				display: none;
			}
		}

		li {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--ls-ui-lg, normal);
			white-space: nowrap;
			padding-inline: 0.5rem;
			text-align: right;
			--skeleton-width: 5ch;
			--skeleton-height: 1.2em;
			--skeleton-radius: var(--radius-xxs);

			@media (--viewport-md-down) {
				font: var(--f-ui-md-roman);
				letter-spacing: var(--ls-ui-md, normal);
			}

			/* override skeleton position */
			&.skeleton::before {
				right: 0.5rem;
			}

			&.price-change {
				font-weight: 500;
			}
		}
	}
</style>
