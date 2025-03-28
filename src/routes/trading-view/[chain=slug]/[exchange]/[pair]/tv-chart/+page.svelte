<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import Section from '$lib/components/Section.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import CandleSeries from '$lib/charts/CandleSeries.svelte';
	import CandleVolumeSeries from '$lib/charts/CandleVolumeSeries.svelte';
	import { CandleDataFeed } from '$lib/charts/candle-data-feed.svelte.js';
	import { OptionGroup } from '$lib/helpers/option-group.svelte.js';
	import { formatSwapFee } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatTokenAmount } from '$lib/helpers/formatters';

	let { data } = $props();
	let { summary } = $derived(data);

	let swapFee = $derived(formatSwapFee(summary.pair_swap_fee));

	let breadcrumbs = $derived({
		[summary.chain_slug]: summary.chain_name,
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name,
		'tv-chart': 'TradingView Chart'
	});

	// TODO: refactor to somewhere!
	// TODO: handle sub-day formatting (add `HH:MM`), or use another method w/in snippet
	const formatter = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});

	let timeBucket = new OptionGroup(CandleDataFeed.timeBuckets, '1d');

	let priceFeed = $derived(
		new CandleDataFeed(fetch, 'candles', timeBucket.selected, {
			candle_type: 'price',
			pair_id: summary.pair_id,
			exchange_type: summary.exchange_type
		})
	);

	let tvlFeed = $derived(
		new CandleDataFeed(fetch, 'candles', timeBucket.selected, {
			candle_type: 'tvl',
			pair_id: summary.pair_id,
			exchange_type: summary.exchange_type
		})
	);
</script>

<svelte:head>
	<title>
		TradingView Chart | {summary.pair_symbol} ({swapFee}) token price on {summary.exchange_name}
	</title>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main class="tv-chart-page ds-3">
	<PageHeader>
		<span slot="title">
			{summary.pair_symbol}
			<span class="swap-fee">{swapFee}</span>
		</span>
		<span slot="subtitle" class="subtitle">
			token pair on {summary.exchange_name} on
			<EntitySymbol size="0.875em" label={summary.chain_name} logoUrl={getLogoUrl('blockchain', summary.chain_slug)} />
		</span>
	</PageHeader>

	<Section padding="md" gap="xs">
		<div class="chart-header">
			<h2>{summary.pair_symbol} TradingView chart</h2>
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

			<!-- TODO: refactor this to Tooltip components -->
			{#snippet tooltip({ point }, [price, volume, tvl])}
				{@const priceInfo = getProfitInfo((price?.close - price?.open) / (1 + price?.open))}
				{@const tvlInfo = getProfitInfo((tvl?.close - tvl?.open) / (1 + tvl?.open))}
				<div class="tooltip" style:--x="{point.x}px" style:--y="{point.y}px">
					<header>
						<h3>{formatter.format(new Date((price?.time as number) * 1000))}</h3>
					</header>
					<table class="metrics">
						<thead>
							<tr>
								<th class="metric"></th>
								<th class="price">Price</th>
								<th class="tvl">TVL</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th class="metric">% ▲▼</th>
								<td class="price {priceInfo.directionClass}">{priceInfo.value ? priceInfo : '---'}</td>
								<td class="tvl {tvlInfo.directionClass}">{tvlInfo.value ? tvlInfo : '---'}</td>
							</tr>
							<tr>
								<th class="metric">Open</th>
								<td class="price {priceInfo.directionClass}">{formatTokenAmount(price?.open, 3)}</td>
								<td class="tvl {tvlInfo.directionClass}">{formatTokenAmount(tvl?.open, 3)}</td>
							</tr>
							<tr>
								<th class="metric">High</th>
								<td class="price {priceInfo.directionClass}">{formatTokenAmount(price?.high, 3)}</td>
								<td class="tvl {tvlInfo.directionClass}">{formatTokenAmount(tvl?.high, 3)}</td>
							</tr>
							<tr>
								<th class="metric">Low</th>
								<td class="price {priceInfo.directionClass}">{formatTokenAmount(price?.low, 3)}</td>
								<td class="tvl {tvlInfo.directionClass}">{formatTokenAmount(tvl?.low, 3)}</td>
							</tr>
							<tr>
								<th class="metric">Close</th>
								<td class="price {priceInfo.directionClass}">{formatTokenAmount(price?.close, 3)}</td>
								<td class="tvl {tvlInfo.directionClass}">{formatTokenAmount(tvl?.close, 3)}</td>
							</tr>
							<tr>
								<th class="metric">Volume</th>
								<td class="volume">{formatTokenAmount(volume?.value, 3)}</td>
							</tr>
						</tbody>
					</table>
				</div>
			{/snippet}
		</TvChart>
	</Section>
</main>

<style>
	.subtitle {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5ex;
	}

	.swap-fee {
		margin-left: var(--space-xxs);
		color: var(--c-text-extra-light);
	}

	.chart-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;

		h2 {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--ls-heading-xl, normal);
		}
	}

	/* Hack to add label to 2nd pane (tr: 2 * paneIndx + 1) */
	.tv-chart-page :global(table:not(.metrics) tr:nth-child(3) td:nth-child(2)::before) {
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

	.tooltip {
		position: absolute;
		display: grid;
		margin-left: 0.75rem;
		min-width: 12rem;
		padding: 1.125rem;
		border-radius: var(--radius-md);
		background: hsl(from var(--c-text-inverted) h s l / 80%);
		box-shadow: var(--shadow-3);
		letter-spacing: var(--ls-ui-sm, normal);
		z-index: 3;

		top: var(--y);
		left: var(--x);

		h3 {
			font: var(--f-ui-sm-bold);
			color: var(--c-text-light);
		}

		.metrics {
			width: 100%;
			border-collapse: collapse;
			font: var(--f-ui-sm-medium);

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
			}

			.tvl {
				/* display: none; */
			}

			tbody tr:last-child {
				border-top: 1px solid var(--c-text-ultra-light);
			}

			.volume {
				color: var(--c-text-light);
			}
		}
	}
</style>
