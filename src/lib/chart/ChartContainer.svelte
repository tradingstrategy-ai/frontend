<script lang="ts">
	import type { TimeInterval } from 'd3-time';
	import type { Periodicity, TimeBucket } from '$lib/chart';
	import { utcHour, utcDay } from 'd3-time';
	import { SegmentedControl } from '$lib/components';

	export let title: string;

	let timeSpanKey: TimeBucket = '3m';

	type TimeSpan = {
		spanDays: number;
		interval: TimeInterval;
		periodicity: Periodicity;
	};

	const timeSpans: Record<TimeBucket, TimeSpan> = {
		'1w': {
			spanDays: 7,
			interval: utcHour,
			periodicity: { period: 1, interval: 60, timeUnit: 'minute' }
		},
		'1m': {
			spanDays: 30,
			interval: utcHour.every(4)!,
			periodicity: { period: 1, interval: 4 * 60, timeUnit: 'minute' }
		},
		'3m': {
			spanDays: 90,
			interval: utcDay.every(1)!,
			periodicity: { period: 1, interval: 1, timeUnit: 'day' }
		}
	} as const;
</script>

<div class="chart-container">
	<header>
		<h2>{title}</h2>
		<SegmentedControl options={Object.keys(timeSpans)} bind:selected={timeSpanKey} />
	</header>
	<slot name="subtitle" />
	<slot timeSpan={timeSpans[timeSpanKey]} />
	<slot name="footer" />
</div>

<style lang="postcss">
	.chart-container {
		display: grid;
		gap: var(--space-sm);
		background: hsla(var(--hsl-box), var(--a-box-a));
		border-radius: var(--radius-md);
		padding: var(--space-lg) var(--space-lg);
		--chart-aspect-ratio: 2;

		@media (--viewport-md-down) {
			padding: var(--space-md);
		}

		@media (--viewport-sm-down) {
			--chart-aspect-ratio: 1.75;
		}

		@media (--viewport-xs) {
			--chart-aspect-ratio: 1.25;
		}

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: var(--space-sm);

			:global(.segmented-control) {
				text-transform: uppercase;
			}
		}

		h2 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		:global(:is([slot='subtitle'], [slot='footer'])) {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}
	}
</style>
