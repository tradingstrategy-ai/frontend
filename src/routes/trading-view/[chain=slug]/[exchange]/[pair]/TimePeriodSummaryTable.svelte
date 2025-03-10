<!--
@component
Display summary performance table for various periods.

@example

```svelte
	<TimePeriodSummaryTable pairId={1234} exchangeType="uniswap_v2" />
```
-->
<script lang="ts">
	import TimePeriodSummaryColumn from './TimePeriodSummaryColumn.svelte';
	import { SegmentedControl } from '$lib/components';

	export let pairId: number | string;
	export let hideLiquidityAndTrades = false;

	let selected = 'daily';
</script>

<div class="time-period-picker">
	<SegmentedControl options={['hourly', 'daily', 'weekly', 'monthly']} bind:selected />
</div>

<div class="time-period-table">
	<ul>
		<li class="col-heading"></li>
		<li>Change</li>
		<li>Open</li>
		<li>Highest</li>
		<li>Lowest</li>
		<li>Close</li>
		<li>Volume</li>
		{#if !hideLiquidityAndTrades}
			<li>Highest liquidity</li>
			<li>Lowest liquidity</li>
			<li>Buying trades</li>
			<li>Selling trades</li>
		{/if}
	</ul>

	{#each ['hourly', 'daily', 'weekly', 'monthly'] as period}
		<TimePeriodSummaryColumn {pairId} {hideLiquidityAndTrades} {period} active={period === selected} />
	{/each}
</div>

<style>
	.time-period-picker {
		text-transform: capitalize;

		@media (--viewport-md-up) {
			display: none;
		}
	}

	.time-period-table {
		display: grid;
		grid-template-columns: 3fr 2fr;
		overflow: hidden;

		@media (--viewport-md-up) {
			grid-template-columns: repeat(5, 1fr);
		}

		/* Row heading specific styles */
		li {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--ls-ui-lg, normal);
			color: var(--c-text-light);

			@media (--viewport-md-down) {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md, normal);
			}
		}

		/* Shared :global ul/li styles (see TimePeriodSummaryColumn.svelte) */
		:global(ul) {
			list-style-type: none;
			padding: 0;
			display: grid;
		}

		:global(li) {
			padding-block: 0.75rem;
			border-bottom: 1px solid var(--c-text-ultra-light);

			@media (--viewport-md-up) {
				padding-block: 1rem;
			}
		}

		:global(li.col-heading) {
			height: 1.375em;
			padding-block: 0;
			border-bottom: none;
			font: var(--f-heading-sm-medium);
			text-transform: capitalize;

			@media (--viewport-md-down) {
				font: var(--f-heading-xs-medium);
			}

			@media (--viewport-sm-down) {
				display: none;
			}
		}
	}
</style>
