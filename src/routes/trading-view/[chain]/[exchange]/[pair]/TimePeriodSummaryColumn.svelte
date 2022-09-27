<!--
@component
Display summary performance data for a given period; lazy-fetches data from
backend API when scrolled into view.

#### Usage:
```tsx
<TimeSpanPerformance pairId="1234" period="hourly|daily|weekly|monthly" />
```
-->
<script lang="ts">
	import { backendUrl } from '$lib/config';
	import { inview } from 'svelte-inview';
	import { formatDollar, formatAmount, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let pairId: string;
	export let period: string;
	export let active = false;

	let loading = true;
	let tradeData = {};
	let priceChangeColorClass = '';

	const inviewOptions = {
		rootMargin: '100px',
		unobserveOnEnter: true
	};

	// see: https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
	const apiUrl = `${backendUrl}/pair-trade-data`;

	async function loadData() {
		const params = new URLSearchParams({ pair_id: pairId, period });

		const resp = await fetch(`${apiUrl}?${params}`);
		if (!resp.ok) {
			console.error(resp);
			return;
		}

		loading = false;
		tradeData = await resp.json();
	}

	function getPriceChange({ price_close = 0, price_open = 0 }) {
		return price_close - price_open;
	}

	// close > open determines if the period was succesful
	$: priceChangeColorClass = determinePriceChangeClass(getPriceChange(tradeData));
</script>

<ul use:inview={inviewOptions} on:enter={loadData} class:loading class:active>
	<li class="col-heading {priceChangeColorClass}">{period}</li>
	<li class={priceChangeColorClass} style:--skeleton-width="30%">
		{loading ? '' : formatPriceChange(tradeData.price_close / tradeData.price_open - 1)}
	</li>
	<li style:--skeleton-width="40%">
		{loading ? '' : formatDollar(tradeData.price_open)}
	</li>
	<li style:--skeleton-width="40%">
		{loading ? '' : formatDollar(tradeData.price_high)}
	</li>
	<li style:--skeleton-width="40%">
		{loading ? '' : formatDollar(tradeData.price_low)}
	</li>
	<li style:--skeleton-width="40%">
		{loading ? '' : formatDollar(tradeData.price_close)}
	</li>
	<li>
		{loading ? '' : formatDollar(tradeData.volume)}
	</li>
	<li>
		{loading ? '' : formatDollar(tradeData.liquidity_high)}
	</li>
	<li>
		{loading ? '' : formatDollar(tradeData.liquidity_low)}
	</li>
	<li style:--skeleton-width="40%">
		{loading ? '' : formatAmount(tradeData.buys)}
	</li>
	<li style:--skeleton-width="40%">
		{loading ? '' : formatAmount(tradeData.sells)}
	</li>
</ul>

<style lang="postcss">
	.col-heading {
		text-transform: capitalize;
	}

	.loading {
		& li:first-child {
			color: var(--c-text-7);
		}

		,
		& li:not(:first-child) {
			width: var(--skeleton-width, 50%);
			background: var(--c-background-2);
			background-clip: content-box;
			padding-block: 0.1rem;
		}
	}
</style>
