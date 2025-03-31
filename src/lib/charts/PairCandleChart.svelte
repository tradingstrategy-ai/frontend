<script lang="ts">
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import CandleSeries from '$lib/charts/CandleSeries.svelte';
	import CandleVolumeSeries from '$lib/charts/CandleVolumeSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import { CandleDataFeed } from '$lib/charts/candle-data-feed.svelte.js';
	import { OptionGroup } from '$lib/helpers/option-group.svelte.js';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import { relativeProfitability } from '$lib/helpers/profit.js';

	type Props = {
		exchangeType: string;
		pairId: string;
		pairSymbol: string;
	};

	let { exchangeType, pairId, pairSymbol }: Props = $props();

	// TODO: refactor to somewhere!
	// TODO: handle sub-day formatting (add `HH:MM`), or use another method w/in snippet
	const formatter = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});

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
		/>

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
				<h3>{formatter.format(new Date((time as number) * 1000))}</h3>
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

		h3 {
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

		/* Hack to add label to 2nd pane (tr: 2 * paneIndx + 1) */
		:global(table:not(.metrics) tr:nth-child(3) td:nth-child(2)::before) {
			position: absolute;
			z-index: 2;
			top: 0.25rem;
			padding: 0.125em 0.25em 0.125em 0;
			background: hsl(from var(--c-body) h s l / 60%);
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--ls-ui-sm);
			color: var(--c-text-extra-light);
			content: 'TVL & VOLUME';
		}
	}
</style>
