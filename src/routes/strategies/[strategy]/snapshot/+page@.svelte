<script lang="ts">
	import type { AreaSeriesPartialOptions } from 'lightweight-charts';
	import type { TvChartOptions } from '$lib/charts/types.js';
	import StrategyIcon from 'trade-executor/components/StrategyIcon.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import Section from '$lib/components/Section.svelte';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { relativeReturn } from '$lib/helpers/financial';

	const { data } = $props();
	const { strategy, chartData, range } = data;

	const first = chartData.find(({ time }) => time >= range.from);
	const last = chartData.findLast(({ time }) => time <= range.to);

	const periodPerformance = getProfitInfo(relativeReturn(first?.value, last?.value));

	const chartOptions: TvChartOptions = {
		handleScroll: false,
		handleScale: false,
		rightPriceScale: { visible: false },
		timeScale: { visible: false }
	};

	const areaSeriesOptions: AreaSeriesPartialOptions = {
		lineWidth: 3,
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};
</script>

<Section padding="md" gap="sm">
	<h2>Performance Snapshot</h2>

	<div class="performance-snapshot ds-3">
		<header>
			<div class="icon">
				<StrategyIcon {strategy} />
			</div>
			<div class="content">
				<h3 class="truncate">{strategy.name}</h3>
				<Profitability of={periodPerformance.value} />
			</div>
		</header>

		<TvChart options={chartOptions}>
			<AreaSeries
				data={chartData}
				direction={periodPerformance.direction}
				options={areaSeriesOptions}
				priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
				callback={({ chart }) => chart.timeScale().setVisibleRange(range)}
			/>
		</TvChart>
	</div>
</Section>

<style>
	h2 {
		font: var(--f-heading-xl-medium);
		letter-spacing: var(--ls-heading-xl, normal);
	}

	.performance-snapshot {
		:global([data-css-props]) {
			--chart-aspect-ratio: 2;
		}

		width: 30rem;
		height: fit-content;
		padding-block: 1rem;
		outline: 4px solid var(--c-box-4);

		header {
			--icon-size: 5rem;
			display: grid;
			grid-template-columns: var(--icon-size) auto;
			align-items: center;
			gap: 1rem;
			padding-inline: 1rem;
		}

		.icon {
			height: var(--icon-size);
			width: var(--icon-size);
			border-radius: 100%;
		}

		.content {
			display: grid;
			gap: 0.25rem;
			justify-items: start;

			/* font settings inherited by Profitability */
			font: var(--f-heading-md-bold);
			letter-spacing: var(--ls-heading-md, normal);
		}

		h3 {
			margin: 0;
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--ls-heading-lg, normal);
			color: var(--c-text-light);
		}
	}
</style>
