<!--
@component
Display a chart container with title, description and timespan selector.

@example

```svelte
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
	import { utcHour, utcDay } from 'd3-time';
	import { SegmentedControl } from '$lib/components';

	export let title = '';
	export let selected = '3M';

	type TimeSpan = {
		performanceLabel: string;
		spanDays?: number;
		interval: TimeInterval;
	};

	const timeSpans: Record<string, TimeSpan> = {
		'1W': {
			performanceLabel: 'past week',
			spanDays: 7,
			interval: utcHour
		},
		'1M': {
			performanceLabel: 'past month',
			spanDays: 30,
			interval: utcHour.every(4)!
		},
		'3M': {
			performanceLabel: 'past 90 days',
			spanDays: 90,
			interval: utcDay
		},
		Max: {
			performanceLabel: 'lifetime',
			interval: utcDay
		}
	};

	$: timeSpan = timeSpans[selected];
</script>

<div class="chart-container" data-css-props>
	<header>
		<slot name="title" {timeSpan}>
			<h2>{title}</h2>
		</slot>
		<SegmentedControl secondary options={Object.keys(timeSpans)} bind:selected />
		<slot name="subtitle" />
	</header>
	<slot {timeSpan} />
	<slot name="footer" />
</div>

<style>
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
