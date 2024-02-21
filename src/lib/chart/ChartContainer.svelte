<!--
@component
Display a chart container with title, description and timespan selector.

#### Usage:
```tsx
<ChartContainer title="Performance" let:timeSpan>
	<p slot="subtitle">
		Chart description…
	</p>
	<SomeChart />
</ChartContainer>
```
-->

<script lang="ts">
	import type { TimeInterval } from 'd3-time';
	import type { Periodicity, TimeBucket } from '$lib/chart';
	import { utcHour, utcDay } from 'd3-time';
	import { SegmentedControl } from '$lib/components';

	export let title = '';

	let timeSpanKey: TimeBucket = '3m';

	type TimeSpan = {
		label: string;
		spanDays: number;
		interval: TimeInterval;
		periodicity: Periodicity;
	};

	const timeSpans: Record<TimeBucket, TimeSpan> = {
		'1w': {
			label: '1W',
			spanDays: 7,
			interval: utcHour,
			periodicity: { period: 1, interval: 60, timeUnit: 'minute' }
		},
		'1m': {
			label: '1M',
			spanDays: 30,
			interval: utcHour.every(4)!,
			periodicity: { period: 1, interval: 4 * 60, timeUnit: 'minute' }
		},
		'3m': {
			label: '3M',
			spanDays: 90,
			interval: utcDay.every(1)!,
			periodicity: { period: 1, interval: 1, timeUnit: 'day' }
		}
	} as const;
</script>

<div class="chart-container" data-css-props>
	<header>
		<slot name="title" timeSpan={timeSpans[timeSpanKey]}>
			<h2>{title}</h2>
		</slot>
		<SegmentedControl secondary options={Object.keys(timeSpans)} bind:selected={timeSpanKey} />
		<slot name="subtitle" />
	</header>
	<slot timeSpan={timeSpans[timeSpanKey]} />
</div>

<style lang="postcss">
	[data-css-props] {
		--chart-container-padding: 1.5rem;

		@media (--viewport-md-down) {
			--chart-container-padding: 1rem;
		}
	}

	.chart-container {
		display: grid;
		gap: var(--space-sm);
		background: var(--c-box-1);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		padding-block: var(--chart-container-padding);

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: var(--space-sm);
			padding-inline: var(--chart-container-padding);

			@media (--viewport-xs) {
				grid-template-columns: 1fr;
			}

			:global(.segmented-control) {
				text-transform: uppercase;

				@media (--viewport-xs) {
					grid-row: 3;
				}
			}

			h2 {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}

			:global([slot='subtitle']) {
				grid-column: 1 / -1;
			}
		}

		:global([slot='subtitle']) {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}
	}
</style>
