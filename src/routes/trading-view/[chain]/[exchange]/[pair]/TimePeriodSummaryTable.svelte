<!--
@component
Display summary performance table for various periods.

#### Usage:
```tsx
	<TimePeriodSummaryTable pairId={1234} />
```
-->
<script lang="ts">
	import TimePeriodSummaryColumn from './TimePeriodSummaryColumn.svelte';
	import TimePeriodPicker from './TimePeriodPicker.svelte';

	export let pairId: number | string;

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
		@media (--viewport-lg-up) {
			display: none;
		}
	}

	.time-period-table :global {
		display: grid;
		grid-template-columns: 3fr 2fr;
		overflow: hidden;

		@media (--viewport-lg-up) {
			grid-template-columns: repeat(5, 1fr);
		}

		& ul {
			list-style-type: none;
			padding: 0;
			display: grid;
		}

		& li {
			--skeleton-width: 5ch;
			--skeleton-height: 1.2em;
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
			white-space: nowrap;
			padding-inline: var(--space-2xs);

			&.col-heading {
				height: 1.4em;
				font: var(--f-h4-medium);
				text-transform: capitalize;

				@media (--viewport-md-down) {
					display: none;
				}
			}

			&:not(.col-heading) {
				padding-block: var(--space-sm);

				@media (--viewport-md-up) {
					padding-block: var(--space-md);

					&:not(:last-child) {
						border-bottom: 1px solid var(--c-border-1-v1);
					}
				}
			}
		}

		& .row-heading li {
			font-weight: 500;
			padding-inline: 0;
		}

		& .loading li.col-heading {
			color: var(--c-text-7-v1);
		}

		& .time-period-col:not(.active) {
			@media (--viewport-md-down) {
				display: none;
			}
		}
	}
</style>
