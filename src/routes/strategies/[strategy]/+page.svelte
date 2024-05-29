<script lang="ts">
	import { type Quote, ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { getChartClient } from 'trade-executor/chart';
	import { MyDeposits } from '$lib/wallet';
	import { UpDownCell } from '$lib/components';
	import SummaryMetrics from './SummaryMetrics.svelte';
	import { formatPercent } from '$lib/helpers/formatters';
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { relativeProfitability } from 'trade-executor/helpers/profit';
	import { isGeoBlocked } from '$lib/helpers/geo';

	export let data;
	const { chain, strategy, admin, ipCountry } = data;

	const backtestLink = `/strategies/${strategy.id}/backtest`;
	const keyMetrics = strategy.summary_statistics.key_metrics;
	const geoBlocked = !admin && isGeoBlocked('strategies:deposit', ipCountry);

	let periodPerformance: MaybeNumber;

	function dataSegmentChange(first: Maybe<Quote>, last: Maybe<Quote>) {
		periodPerformance = relativeProfitability(first?.Close, last?.Close);
	}

	const chartClient = getChartClient(fetch, strategy.url);

	chartClient.fetch({
		type: 'compounding_unrealised_trading_profitability_sampled',
		source: 'live_trading'
	});

	const chartOptions = {
		controls: { home: null },
		allowScroll: false,
		allowZoom: false,
		xaxisHeight: 20,
		chart: {
			xAxis: { displayBorder: false, fitLeftToRight: true },
			yAxis: { noDraw: true }
		}
	};
</script>

<svelte:head>
	<title>{strategy.name} | Trading Strategy</title>
	<meta name="description" content={strategy.short_description} />
</svelte:head>

<div class="strategy-overview-page">
	<MyDeposits {strategy} {chain} {geoBlocked} {ipCountry} />

	<div class="chart">
		<ChartContainer let:timeSpan={{ spanDays, interval, periodicity }}>
			<div class="period-performance" slot="title" let:timeSpan={{ label }}>
				{#if periodPerformance !== undefined}
					<UpDownCell value={periodPerformance} formatter={formatProfitability} />
					Last {label}
				{/if}
			</div>

			<PerformanceChart
				options={chartOptions}
				loading={$chartClient.loading}
				data={normalizeDataForInterval($chartClient.data ?? [], interval)}
				formatValue={formatPercent}
				{spanDays}
				{periodicity}
				{dataSegmentChange}
			/>
		</ChartContainer>
	</div>

	<SummaryMetrics {keyMetrics} {backtestLink} />
</div>

<style lang="postcss">
	.strategy-overview-page {
		display: grid;
		gap: 1rem;
		align-items: flex-start;

		/* Desktop 2 column layout */
		@media (--viewport-md-up) {
			gap: 1.5rem;
			grid-template-columns: 2fr minmax(17rem, 1fr);

			/* move deposit widget (1st element) to row 2, col 2 */
			> :global(:nth-child(1)) {
				grid-area: 2 / 2;
			}

			/* chart and description (2nd & 4th elements) span full row width */
			> :global(:nth-child(2n)) {
				grid-column: 1 / -1;
			}
		}

		.chart {
			:global([data-css-props]) {
				--chart-aspect-ratio: 3.25;

				@media (--viewport-sm-down) {
					--chart-aspect-ratio: 2.25;
				}

				@media (--viewport-xs) {
					--chart-aspect-ratio: 1.75;
				}
			}

			:global(.stx_xaxis) {
				color: transparent;
			}

			:global(.stx_xaxis_dark) {
				color: var(--c-text-extra-light);
			}
		}

		.period-performance {
			:global([data-css-props]) {
				--up-down-font: var(--f-ui-lg-medium);
				--up-down-letter-spacing: var(--ls-ui-lg);

				@media (--viewport-md-down) {
					--up-down-font: var(--f-ui-md-medium);
					--up-down-letter-spacing: var(--ls-ui-md);
				}
			}

			display: flex;
			gap: 1em;
			align-items: center;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm);
			color: var(--c-text-extra-light);
		}
	}
</style>
