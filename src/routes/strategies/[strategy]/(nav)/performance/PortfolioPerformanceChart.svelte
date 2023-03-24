<!--
@component
Render the portfolio performance chart using ChartIQ.
- X-axis: time
- Y-axis: portfolio value
-->
<script lang="ts">
	import { lightFormat as formatDate } from 'date-fns';
	import { formatDollar } from '$lib/helpers/formatters';
	import { SummaryBox, UpDownCell } from '$lib/components';
	import { ChartIQ, Marker } from '$lib/chart';

	export let name: string;
	export let portfolio;

	const options = {
		layout: { chartType: 'line' },
		controls: { chartControls: null },
		chart: {
			xAxis: { displayGridLines: false },
			yAxis: { displayGridLines: false }
		}
	};

	function getChartData(portfolio) {
		if (!portfolio) return [];
		return portfolio.map((tick) => {
			return {
				DT: tick.calculated_at * 1000,
				Value: tick.total_equity
			};
		});
	}

	function init(chartEngine: any) {
		return {
			update() {
				chartEngine.loadChart(name, {
					periodicity: { period: 24, interval: 60, timeUnit: 'minute' },
					span: { base: 'day', multiplier: 90 },
					masterData: getChartData(portfolio)
				});
			}
		};
	}
</script>

{#if portfolio}
	<SummaryBox title="Total equity" subtitle="Cash and market valued tokens in the strategy (USD)">
		<div class="portfolio-performance-chart">
			<ChartIQ {init} {options} let:cursor>
				{@const { position, data } = cursor}
				{#if data}
					<Marker x={position.DateX} y={position.CloseY} --marker-color="hsla(var(--hsl-text-light))" />
					<div class="info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
						<UpDownCell value={data.Close - data.iqPrevClose}>
							<div class="date">{formatDate(data.displayDate, 'M/d/yyyy')}</div>
							<div class="value">{formatDollar(data.Close)}</div>
						</UpDownCell>
					</div>
				{/if}
			</ChartIQ>
		</div>
	</SummaryBox>
{/if}

<style lang="postcss">
	.portfolio-performance-chart {
		--chart-aspect-ratio: 2;

		@media (--viewport-sm-down) {
			--chart-aspect-ratio: 1.75;
		}

		@media (--viewport-xs) {
			--chart-aspect-ratio: 1.25;
		}
	}

	.info {
		position: absolute;
		left: var(--x);
		top: var(--y);
		background: hsla(var(--hsl-body), 0.8);
		border-radius: var(--radius-sm);
		transform: translate(-50%, calc(-100% - var(--space-md)));

		& .date {
			font: var(--f-ui-xs-bold);
			letter-spacing: var(--f-ui-xs-spacing);
			color: hsla(var(--hsl-text), 0.4);
		}

		& .value {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing);
		}
	}
</style>
