<!--
@component
Display summary performance data for a given period; lazy-fetches data from
backend API when scrolled into view.

#### Usage:
```tsx
<TimeSpanPerformance pairId={1234} period="hourly|daily|weekly|monthly" />
```
-->
<script lang="ts">
	import config from '$lib/config';
	import { inview } from 'svelte-inview';
	import { formatDollar, formatAmount, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import Skeleton from '$lib/Skeleton.svelte';

	const { backendUrl } = config;

	export let pairId: number;
	export let period: string;

	let tradeData = null;
	let priceChangeColorClass = '';

	const inviewOptions = {
		rootMargin: '100px',
		unobserveOnEnter: true
	};

	// see: https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
	async function loadData() {
		const params = new URLSearchParams({
			pair_id: pairId.toString(),
			period
		});
		const apiUrl = `${backendUrl}/pair-trade-data?${params}`;

		const resp = await fetch(apiUrl);
		if (!resp.ok) {
			console.error(resp);
			return;
		}

		tradeData = await resp.json();
	}

	function getPriceChange(data) {
		return data ? data.price_close - data.price_open : 0;
	}

	// close > open determines if the period was succesful
	$: priceChangeColorClass = determinePriceChangeClass(getPriceChange(tradeData));
</script>

<table use:inview={inviewOptions} on:enter={loadData}>
	<tr>
		<th class="title {priceChangeColorClass}" colspan="2">
			{period}
		</th>
	</tr>

	<tr class="data-row">
		<th>Change</th>
		<td>
			<span class={priceChangeColorClass}>
				{#if tradeData}
					{formatPriceChange(tradeData.price_close / tradeData.price_open - 1)}
				{:else}
					<Skeleton layout="line" />
				{/if}
			</span>
		</td>
	</tr>

	<tr class="data-row">
		<th>Open price</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.price_open)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Highest price</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.price_high)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Lowest price</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.price_low)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Close price</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.price_close)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Volume</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.volume)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Highest liquidity</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.liquidity_high)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Lowest liquidity</th>
		<td>
			{#if tradeData}
				{formatDollar(tradeData.liquidity_low)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Buying trades</th>
		<td>
			{#if tradeData}
				{formatAmount(tradeData.buys)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>

	<tr class="data-row">
		<th>Selling trades</th>
		<td>
			{#if tradeData}
				{formatAmount(tradeData.sells)}
			{:else}
				<Skeleton layout="line" />
			{/if}
		</td>
	</tr>
</table>

<style>
	table {
		width: 100%;
		max-width: 18rem;
	}

	.data-row {
		font-size: 80%;
	}

	.title {
		text-transform: capitalize;
	}
</style>
