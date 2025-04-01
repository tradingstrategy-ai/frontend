<script lang="ts">
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import CandleSeries from '$lib/charts/CandleSeries.svelte';
	import CandleVolumeSeries from '$lib/charts/CandleVolumeSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { CandleDataFeed } from '$lib/charts/candle-data-feed.svelte.js';
	import { OptionGroup } from '$lib/helpers/option-group.svelte.js';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import { relativeProfitability } from '$lib/helpers/profit.js';
	import { formatDate } from './helpers';
	import IconQuestionCircle from '~icons/local/question-circle';

	type Props = {
		exchangeType: string;
		pairId: string;
		pairSymbol: string;
	};

	let { exchangeType, pairId, pairSymbol }: Props = $props();

	// TODO: handle via page url params
	let timeBucket = new OptionGroup(CandleDataFeed.timeBuckets, '1d');

	let priceFeed = $derived(
		new CandleDataFeed(fetch, 'candles', timeBucket.selected, {
			candle_type: 'price',
			pair_id: pairId,
			exchange_type: exchangeType
		})
	);

	let tvlFeed = $derived(
		new CandleDataFeed(fetch, 'candles', timeBucket.selected, {
			candle_type: 'tvl',
			pair_id: pairId,
			exchange_type: exchangeType
		})
	);
</script>

<div class="pair-candle-chart">
	<div class="chart-header">
		<h2>{pairSymbol} TradingView chart</h2>
		<SegmentedControl name="timeBucket" options={timeBucket.options} bind:selected={timeBucket.selected} />
	</div>

	<TvChart loading={priceFeed.loadingInitialData}>
		<CandleSeries dataFeed={priceFeed} priceScale={{ scaleMargins: { top: 0.1, bottom: 0.1 } }} />

		<CandleVolumeSeries dataFeed={priceFeed} paneIndex={1} priceScale={{ scaleMargins: { top: 0.25, bottom: 0 } }} />

		<CandleSeries
			dataFeed={tvlFeed}
			options={{ lastValueVisible: false }}
			paneIndex={1}
			priceScale={{ scaleMargins: { top: 0.1, bottom: 0.25 } }}
		>
			<h3>TVL & VOLUME</h3>

			{#if !tvlFeed.hasData}
				<div class="no-tvl-data">
					<Tooltip>
						<span slot="trigger">
							No TVL data
							<IconQuestionCircle />
						</span>
						<span slot="popup">
							No TVL chart data available for {pairSymbol} at {timeBucket.selected} interval. Try switching to a longer candle
							length.
						</span>
					</Tooltip>
				</div>
			{/if}
		</CandleSeries>

		{#snippet tooltip({ point, time }, [price, volume, tvl])}
			{@const priceInfo = getProfitInfo(relativeProfitability(price?.open, price?.close))}
			{@const tvlInfo = getProfitInfo(relativeProfitability(tvl?.open, tvl?.close))}

			{#snippet metricsRow(label: string, property: string)}
				<tr>
					<th>{label}</th>
					<td class={priceInfo.directionClass}>{formatTokenAmount(price?.[property], 3)}</td>
					<td class={tvlInfo.directionClass}>{formatTokenAmount(tvl?.[property], 3)}</td>
				</tr>
			{/snippet}

			<ChartTooltip {point}>
				<h4>{formatDate(time as number, timeBucket.selected)}</h4>
				<table class="metrics">
					<thead>
						<tr>
							<th></th>
							<th>Price</th>
							<th>TVL</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>% ▲▼</th>
							<td class={priceInfo.directionClass}>{priceInfo}</td>
							<td class={tvlInfo.directionClass}>{tvlInfo}</td>
						</tr>
						{@render metricsRow('Open', 'open')}
						{@render metricsRow('High', 'high')}
						{@render metricsRow('Low', 'low')}
						{@render metricsRow('Close', 'close')}
						<tr>
							<th>Volume</th>
							<td>{formatTokenAmount(volume?.value, 3)}</td>
						</tr>
					</tbody>
				</table>
			</ChartTooltip>
		{/snippet}
	</TvChart>
</div>

<style>
	.pair-candle-chart {
		display: grid;
		gap: 1rem;

		.chart-header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;

			h2 {
				font: var(--f-heading-xl-medium);
				letter-spacing: var(--ls-heading-xl, normal);
			}
		}

		:is(h3, .no-tvl-data) {
			position: absolute;
			top: 0.25rem;
			padding: 0.125em 0.25em;
			background: hsl(from var(--c-body) h s l / 60%);
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--ls-ui-sm);
			color: var(--c-text-extra-light);
		}

		h3 {
			font: var(--f-ui-sm-bold);
		}

		.no-tvl-data {
			right: 0.25rem;
			color: var(--c-warning);
			pointer-events: auto;

			:global(.popup) {
				min-width: 22rem;
				right: 0;
			}

			:global(.icon) {
				--icon-size: 1.25em;
				transform: translateY(-0.125rem);
				:global(path) {
					stroke-width: 2.5px;
				}
			}
		}

		h4 {
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-light);
		}

		.metrics {
			width: 100%;
			border-collapse: collapse;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm, normal);

			tr * {
				padding-block: 0.25em;
			}

			tbody tr:last-child * {
				padding-bottom: 0;
			}

			thead th {
				border-bottom: 1px solid var(--c-text-ultra-light);
				font: var(--f-ui-xs-medium);
				letter-spacing: 0.1em;
				color: var(--c-text-extra-light);
				text-align: right;
				text-transform: uppercase;
			}

			tbody th {
				color: var(--c-text-extra-light);
				text-align: left;
			}

			td {
				padding-left: 1rem;
				text-align: right;
				min-width: 4.75rem;

				&:not(.bullish, .bearish) {
					color: var(--c-text-light);
				}
			}

			tbody tr:last-child {
				border-top: 1px solid var(--c-text-ultra-light);
			}
		}
	}
</style>
