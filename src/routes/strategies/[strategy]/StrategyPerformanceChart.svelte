<script lang="ts">
	import type { ChartCallbackParam, TvChartOptions } from '$lib/charts/types';
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import BenchmarkSeries from '$lib/charts/BenchmarkSeries.svelte';
	import { getChartClient } from 'trade-executor/client/chart';
	import { getBenchmarkTokens } from 'trade-executor/helpers/benchmark.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

	interface Props {
		strategy: ConnectedStrategyInfo;
	}

	let { strategy }: Props = $props();

	let chartClient = $derived(getChartClient(fetch, strategy.url));

	let chartDataType = $derived(
		strategy.useSharePrice ? 'share_price_based_return' : 'compounding_unrealised_trading_profitability_sampled'
	);

	let benchmarkTokens = $derived(getBenchmarkTokens(strategy));

	let loading = $derived($chartClient.loading || benchmarkTokens.some((t) => t.loading));

	const options: TvChartOptions = {
		handleScroll: false,
		handleScale: false,
		rightPriceScale: { visible: false },
		timeScale: { borderVisible: false }
	};

	// use light color for text labels (set via callback where `colors` is available)
	function callback({ chart, colors }: ChartCallbackParam) {
		chart.applyOptions({
			layout: { textColor: colors.textExtraLight }
		});
	}

	// fetch chart data (initial load or when chartClient is updated)
	$effect(() => {
		chartClient.fetch({
			type: chartDataType,
			source: 'live_trading'
		});
	});
</script>

<div class="strategy-performance-chart">
	<ChartContainer {loading} data={$chartClient.data} formatValue={formatPercent} {options} {callback}>
		{#snippet title(timeSpan, periodPerformance)}
			<div class="period-performance">
				{#if periodPerformance}
					<Profitability of={periodPerformance.value} boxed />
					<span class="performance-label">{timeSpan.performanceLabel}</span>
				{/if}
			</div>
		{/snippet}

		{#snippet series({ data, direction, onVisibleDataChange, timeSpan, range })}
			<AreaSeries
				{data}
				{direction}
				{onVisibleDataChange}
				options={{ priceLineVisible: false, crosshairMarkerVisible: false }}
				priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
			/>

			{#if range}
				{#each benchmarkTokens.filter((t) => t.checked) as token (token.symbol)}
					<BenchmarkSeries {token} {data} timeBucket={timeSpan.timeBucket} {range} />
				{/each}
			{/if}
		{/snippet}

		{#snippet footer()}
			<footer class="benchmark-tokens">
				{#each benchmarkTokens as benchmark (benchmark.pairId)}
					<label style:--color={benchmark.color}>
						<input type="checkbox" name="benchmarks" bind:checked={benchmark.checked} />
						{benchmark.symbol}
						<span class="performance" class:skeleton={benchmark.loading}>
							{formatPercent(benchmark.periodPerformance, 1, 1, { signDisplay: 'exceptZero' })}
						</span>
					</label>
				{/each}
			</footer>
		{/snippet}
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

		footer {
			margin-top: 0.75rem;
			margin-bottom: -0.25rem;
			display: flex;
			gap: 1rem;
			justify-content: center;

			label {
				display: flex;
				gap: 0.25rem;
				align-items: center;
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm);
				/* NOTE: There's no way to remove alpha-channel with color-mix, so have to use */
				/* relative color syntax here (not supported by Mobile Safari < 16.4 ) */
				color: hsl(from var(--color) h s l / 100%);
			}

			input[type='checkbox'] {
				color: inherit;
				accent-color: currentColor;
			}

			.performance {
				font: var(--f-ui-sm-roman);
				min-width: 4ch;
			}
		}
	}
</style>
