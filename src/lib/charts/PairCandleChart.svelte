<script lang="ts">
	import type { TimeBucket } from '$lib/schemas/utility';
	import type { ApiCandle, CandleDataItem, DataFeed, TvChartOptions } from './types';
	import type { OptionGroup } from '$lib/helpers/option-group.svelte.js';
	import { type ApiDataTransformer, CandleDataFeed, apiCandleToDataItem } from '$lib/charts/candle-data-feed.svelte.js';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import CandleSeries from '$lib/charts/CandleSeries.svelte';
	import CandleVolumeSeries from '$lib/charts/CandleVolumeSeries.svelte';
	import ChartHeader from './ChartHeader.svelte';
	import SeriesLabel from './SeriesLabel.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import { relativeReturn } from '$lib/helpers/financial';
	import { formatDate } from './helpers';

	type Props = {
		chainSlug: string;
		exchangeType: string;
		pairId: string;
		pairSymbol: string;
		timeBucket: OptionGroup<TimeBucket>;
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

	const options: TvChartOptions = {
		localization: {
			priceFormatter: (n: number) => formatTokenAmount(n, 1, 2)
		}
	};
</script>

<div class="pair-candle-chart">
	<ChartHeader title="Price / TVL / Volume">
		<SegmentedControl name="timeBucket" options={timeBucket.options} bind:selected={timeBucket.selected} on:change />
	</ChartHeader>

	<TvChart grid crosshairs {options} loading={priceFeed.loadingInitialData}>
		<CandleSeries dataFeed={priceFeed} priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}>
			<SeriesLabel heading bottom>Price</SeriesLabel>
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
			<SeriesLabel heading>TVL & Volume</SeriesLabel>
			{#if tvlFeed && !tvlFeed.hasData}
				<SeriesLabel right class="no-tvl-data">
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
				</SeriesLabel>
			{/if}
		</CandleSeries>

		{#snippet tooltip({ point, time }, [price, volume, tvl])}
			{@const priceInfo = getProfitInfo(relativeReturn(price?.open, price?.close))}
			{@const tvlInfo = getProfitInfo(relativeReturn(tvl?.open, tvl?.close))}

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

		:global(.no-tvl-data) {
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
			margin-bottom: 0.5rem;
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
