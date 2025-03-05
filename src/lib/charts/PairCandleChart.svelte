<script lang="ts">
	import type { Candle } from '$lib/chart/helpers';
	import ChartWrapper from './ChartWrapper.svelte';
	import { Axis, Chart, Svg, Points, Bars, Highlight, Tooltip } from 'layerchart';
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { formatDate, PeriodType } from '@layerstack/utils';

	type Props = {
		candles: Candle[];
	};

	let { candles }: Props = $props();
</script>

<ChartWrapper>
	<div class="chart-container">
		<Chart
			data={candles}
			x="ts"
			xScale={scaleBand().paddingInner(0.4)}
			y={['h', 'l']}
			yNice
			c={({ o, c }: Candle) => (c < o ? 'bearish' : 'bullish')}
			cScale={scaleOrdinal()}
			cDomain={['bearish', 'bullish']}
			cRange={['var(--c-bearish)', 'var(--c-bullish)']}
			padding={{ right: 32, bottom: 24 }}
			tooltip={{ mode: 'bisect-x' }}
		>
			<Svg>
				<Axis placement="right" grid rule />
				<Axis placement="bottom" format={(d) => formatDate(d.date, PeriodType.Day)} />
				<Points links r={0} />
				<Bars y={({ o, c }: Candle) => [o, c]} />
				<Highlight area={{ class: 'highlight' }} />
			</Svg>
			<Tooltip.Root let:data>
				<Tooltip.Header>{formatDate(data.ts, PeriodType.Day)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Open" value={data.o} format="decimal" />
					<Tooltip.Item label="Close" value={data.c} format="decimal" />
					<Tooltip.Item label="High" value={data.h} format="decimal" />
					<Tooltip.Item label="Low" value={data.l} format="decimal" />
				</Tooltip.List>
			</Tooltip.Root>
		</Chart>
	</div>
</ChartWrapper>

<style>
	.chart-container {
		height: 500px;

		:global(.highlight) {
			fill: var(--c-box-4);
		}

		:global(.grid) {
			stroke: var(--c-text-ultra-light);
			opacity: 0.5;
		}
	}
</style>
