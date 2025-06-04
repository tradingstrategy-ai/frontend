<script lang="ts">
	import type { SeriesCallback, TvChartOptions } from '$lib/charts/types.js';
	import { type SeriesMarker, type UTCTimestamp, createSeriesMarkers } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import CandleSeries from '$lib/charts/CandleSeries.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import Section from '$lib/components/Section.svelte';
	import StrategyIcon from 'trade-executor/components/StrategyIcon.svelte';

	const { data } = $props();
	const { strategy, position, candleData, interval, range } = data;

	const dataFeed = {
		loading: false,
		loadingInitialData: false,
		hasData: true,
		hasMoreData: false,
		data: candleData,
		fetchData: () => {}
	};

	const chartOptions: TvChartOptions = {
		handleScroll: false,
		handleScale: false,
		rightPriceScale: { visible: false },
		timeScale: { visible: false },
		layout: { fontSize: 15 }
	};

	const seriesCallback: SeriesCallback = ({ series, colors }) => {
		const markers: SeriesMarker<UTCTimestamp>[] = [];

		if (position.entryTrade) {
			markers.push({
				time: position.entryTrade.executed_at as UTCTimestamp,
				position: 'belowBar',
				color: colors.textLight,
				shape: 'arrowUp',
				text: 'Enter'
			});
		}

		if (position.exitTrade) {
			markers.push({
				time: position.exitTrade.executed_at as UTCTimestamp,
				position: 'aboveBar',
				color: colors.textLight,
				shape: 'arrowDown',
				text: 'Exit'
			});
		}

		createSeriesMarkers(series, markers);
	};
</script>

<Section padding="md" gap="sm">
	<h2>Closed position snapshot</h2>

	<div class="position-snapshot ds-3">
		<header>
			<div class="icon">
				<StrategyIcon {strategy} />
			</div>

			<div class="content">
				<h3 class="truncate">{strategy.name}</h3>
				<h4 class="truncate">{position.pair.symbol} {position.pricingPair.kindShortLabel} position</h4>
			</div>
		</header>

		<TvChart options={chartOptions}>
			<CandleSeries
				{dataFeed}
				callback={seriesCallback}
				priceScaleOptions={{ scaleMargins: { top: 0.2, bottom: 0.2 } }}
			/>
			<BaselineSeries {interval} {range} color="transparent" setChartVisibleRange />
		</TvChart>
	</div>
</Section>

<style>
	.position-snapshot {
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
		}

		h3 {
			margin: 0;
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--ls-heading-lg, normal);
			color: var(--c-text-light);
		}

		h4 {
			margin: 0;
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--ls-heading-sm, normal);
			color: var(--c-text-extra-light);
		}
	}
</style>
