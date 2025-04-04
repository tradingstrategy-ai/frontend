<script lang="ts">
	import type { ApiCandle, CandleTimeBucket, CandleDataItem, DataFeed } from './types';
	import type { OptionGroup } from '$lib/helpers/option-group.svelte.js';
	import {
		type ApiDataTransformer,
		CandleDataFeed,
		calculateClippedCandleScale,
		apiCandleToDataItem
	} from '$lib/charts/candle-data-feed.svelte.js';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import CandleSeries from '$lib/charts/CandleSeries.svelte';
	import CandleVolumeSeries from '$lib/charts/CandleVolumeSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import { relativeProfitability } from '$lib/helpers/profit.js';
	import { formatDate } from './helpers';

	type Props = {
		chainSlug: string;
		exchangeType: string;
		pairId: string;
		pairSymbol: string;
		timeBucket: OptionGroup<CandleTimeBucket>;
	};

	let { chainSlug, exchangeType, pairId, pairSymbol, timeBucket }: Props = $props();

	// NOTE: this is only used for special-case exception
	// remove it once we have better support for base uniswap-v3 1d TVL chart data
	let hideTvlSeries = $derived(chainSlug === 'base' && exchangeType === 'uniswap_v3' && timeBucket.selected === '1d');
	const dummyTvlDataFeed: DataFeed<CandleDataItem> = {
		loading: false,
		hasMoreData: false,
		data: [],
		loadingInitialData: false,
		hasData: false,
		fetchData: (ticks?: number) => {}
	};

	const transformApiData: ApiDataTransformer = (data) => {
		return (data[pairId] ?? []).map((c: ApiCandle) => ({
			...apiCandleToDataItem(c),
			customValues: { volume: c.v }
		}));
	};

	let priceFeed = $derived(
		new CandleDataFeed(
			fetch,
			'candles',
			timeBucket.selected,
			{ candle_type: 'price', pair_id: pairId, exchange_type: exchangeType },
			transformApiData
		)
	);

	let tvlFeed = $derived.by(() => {
		if (hideTvlSeries) return dummyTvlDataFeed;

		return new CandleDataFeed(
			fetch,
			'candles',
			timeBucket.selected,
			{ candle_type: 'tvl', pair_id: pairId, exchange_type: exchangeType },
			transformApiData
		);
	});
</script>

<div class="pair-candle-chart">
	<div class="chart-header">
		<h2>{pairSymbol} chart</h2>
		<SegmentedControl name="timeBucket" options={timeBucket.options} bind:selected={timeBucket.selected} on:change />
	</div>

	<TvChart loading={priceFeed.loadingInitialData}>
		<CandleSeries
			dataFeed={priceFeed}
			priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
			priceScaleCalculator={calculateClippedCandleScale}
		>
			<h3 class="price">Price</h3>
		</CandleSeries>

		<CandleVolumeSeries
			dataFeed={priceFeed}
			paneIndex={1}
			priceScaleOptions={{ scaleMargins: { top: 0.25, bottom: 0 } }}
		/>

		<CandleSeries
			dataFeed={tvlFeed}
			options={{ lastValueVisible: false }}
			paneIndex={1}
			priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.25 } }}
		>
			<h3 class="tvl">TVL & Volume</h3>

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
					{#if tvlFeed.hasData}
						<td class={tvlInfo.directionClass}>{formatTokenAmount(tvl?.[property], 3)}</td>
					{/if}
				</tr>
			{/snippet}

			<ChartTooltip {point}>
				<h4>{formatDate(time as number, timeBucket.selected)}</h4>
				<table class="metrics">
					<thead>
						<tr>
							<th></th>
							<th>Price</th>
							{#if tvlFeed.hasData}
								<th>TVL</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>% ▲▼</th>
							<td class={priceInfo.directionClass}>{priceInfo}</td>
							{#if tvlFeed.hasData}
								<td class={tvlInfo.directionClass}>{tvlInfo}</td>
							{/if}
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
			:global([data-css-props]) {
				@media (--viewport-xs) {
					--segmented-control-font: var(--f-ui-xs-medium);
					--segmented-control-letter-spacing: var(--ls-ui-xs);
				}
			}

			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 0.75rem 1.5rem;
			margin-bottom: 1em;

			h2 {
				flex: 1;
				font: var(--f-h2-medium);
				white-space: nowrap;
			}
		}

		:is(h3, .no-tvl-data) {
			position: absolute;
			padding: 0.125em 0.25em;
			background: hsl(from var(--c-body) h s l / 60%);
		}

		h3 {
			font: var(--f-ui-sm-roman);
			letter-spacing: 0.1em;
			text-transform: uppercase;
			color: var(--c-text-light);

			&.price {
				bottom: 0.25rem;
			}

			&.tvl {
				top: 0.25rem;
			}
		}

		.no-tvl-data {
			top: 0.25rem;
			right: 0.25rem;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm);
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
			white-space: nowrap;
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
