<!--
@component
Display summary performance table for various periods.

#### Usage:
```tsx
	<TimePeriodSummaryTable pairId="1234" />
```
-->
<script lang="ts">
	import TimePeriodSummaryColumn from './TimePeriodSummaryColumn.svelte';
	import TimePeriodPicker from './TimePeriodPicker.svelte';

	export let pairId: string;

	let selected = 'daily';
</script>

<div class="time-period-picker">
	<TimePeriodPicker bind:selected />
</div>

<div class="time-period-table">
	<ul class="row-heading">
		<li class="col-heading" />
		<li>Change</li>
		<li>Open</li>
		<li>Highest</li>
		<li>Lowest</li>
		<li>Close</li>
		<li>Volume</li>
		<li>Highest liquidity</li>
		<li>Lowest liquidity</li>
		<li>Buying trades</li>
		<li>Selling trades</li>
	</ul>

	{#each ['hourly', 'daily', 'weekly', 'monthly'] as period}
		<TimePeriodSummaryColumn {pairId} {period} active={period === selected} />
	{/each}
</div>

<style lang="postcss">
	.time-period-picker {
		display: none;
	}

	.time-period-table :global {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem;
		overflow: hidden;

		& ul {
			list-style-type: none;
			padding: 0;
			display: grid;
			gap: 1rem;
			grid-auto-rows: auto;
		}

		& li {
			--skeleton-padding: 2px;
			font: 400 var(--fs-ui-xl);
			height: 1.4em;
			white-space: nowrap;

			&.col-heading {
				font: var(--f-h4-medium);
				text-transform: capitalize;
			}
		}

		& .row-heading li {
			font-weight: 500;
		}

		& .loading li.col-heading {
			color: var(--c-text-7);
		}
	}

	@media (--viewport-md-down) {
		.time-period-picker {
			display: contents;
		}

		.time-period-table {
			grid-template-columns: 3fr 2fr;
		}

		:global .col-heading {
			display: none;
		}

		:global .time-period-col:not(.active) {
			display: none;
		}
	}
</style>
