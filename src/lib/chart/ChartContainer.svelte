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
	import type { Periodicity } from '$lib/chart';
	import { utcHour, utcDay } from 'd3-time';
	import { SegmentedControl } from '$lib/components';

	export let title = '';

	let timeSpanKey = '3M';

	type TimeSpan = {
		spanDays?: number;
		interval: TimeInterval;
		periodicity: Periodicity;
	};

	const timeSpans: Record<string, TimeSpan> = {
		'1W': {
			spanDays: 7,
			interval: utcHour,
			periodicity: { period: 1, interval: 1, timeUnit: 'hour' }
		},
		'1M': {
			spanDays: 30,
			interval: utcHour.every(4)!,
			periodicity: { period: 4, interval: 1, timeUnit: 'hour' }
		},
		'3M': {
			spanDays: 90,
			interval: utcDay,
			periodicity: { period: 1, interval: 1, timeUnit: 'day' }
		},
		Max: {
			interval: utcDay,
			periodicity: { period: 1, interval: 1, timeUnit: 'day' }
		}
	};
</script>

<div class="chart-container" data-css-props>
	<header>
		<slot name="title" {timeSpanKey}>
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
		:global([data-css-props]) {
			@media (--viewport-xs) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

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
