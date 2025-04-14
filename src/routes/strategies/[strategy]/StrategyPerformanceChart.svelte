<script lang="ts">
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import Profitability from '$lib/components/Profitability.svelte';

	type Props = {
		strategy: ConnectedStrategyInfo;
	};

	let { strategy }: Props = $props();

	const timeSpans = new OptionGroup(['1W', '1M', '3M', 'Max'], '3M');

	const performanceLabels = {
		'1W': 'past week',
		'1M': 'past month',
		'3M': 'past 90 days',
		Max: 'lifetime'
	} as const;

	let performanceLabel = $derived(performanceLabels[timeSpans.selected]);

	// TODO: get periodPerformance based on timeSpans.selected and data
	let periodPerformance = undefined;
</script>

<div class="strategy-performance-chart">
	<ChartContainer {timeSpans}>
		{#snippet title()}
			<div class="period-performance">
				{#if periodPerformance !== undefined}
					<Profitability of={periodPerformance} boxed />
					<span class="performance-label">{performanceLabel}</span>
				{/if}
			</div>
		{/snippet}

		TradingView chart for {strategy.name} ({timeSpans.selected}) coming soon!
	</ChartContainer>
</div>

<style>
	.strategy-performance-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 3.25;

			@media (--viewport-sm-down) {
				--chart-aspect-ratio: 2.25;
			}

			@media (--viewport-xs) {
				--chart-aspect-ratio: 1.75;
			}
		}

		.period-performance {
			display: flex;
			gap: 1em;
			align-items: center;
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--ls-ui-lg);

			@media (--viewport-md-down) {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);
			}

			.performance-label {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm);
				color: var(--c-text-extra-light);
			}
		}
	}
</style>
