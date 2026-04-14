<!--
@component
Render the vault share-price chart with TVL bars and Coinbase BTC/ETH benchmarks.

The benchmark lines are rebased to the vault share price for the selected range
so the relative performance is comparable on a single axis.
-->
<script lang="ts">
	import type { VaultInfo } from './schemas';
	import brandMark from '$lib/assets/brand-mark.svg';
	import { HistogramSeries } from 'lightweight-charts';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import CoinbaseBenchmarkSeries from './CoinbaseBenchmarkSeries.svelte';
	import Series from '$lib/charts/Series.svelte';
	import SeriesLabel from '$lib/charts/SeriesLabel.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatPercent, formatTokenAmount } from '$lib/helpers/formatters';
	import { formatDate, resampleTimeSeries } from '$lib/charts/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let loading = $state(true);
	let priceData = $state<[number, number][]>();
	let tvlData = $state<[number, number][]>();

	function getBenchmarkPercentChange(point: unknown) {
		if (!point || typeof point !== 'object' || !('customValues' in point)) return undefined;
		return (point as { customValues?: { percentChange?: number } }).customValues?.percentChange;
	}

	async function fetchMetrics(vaultId: string) {
		loading = true;
		priceData = undefined;
		tvlData = undefined;
		try {
			const resp = await fetch(`/trading-view/vaults/${vaultId}/metrics`);
			const data = await resp.json();
			priceData = data.price;
			tvlData = data.tvl;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		fetchMetrics(vault.id);
	});

	const formatValue = (v: number) => formatTokenAmount(v, 2);

	const benchmarkLegend = [
		{ label: 'Vault', color: 'var(--c-bullish)', logoUrl: brandMark },
		{ label: 'BTC', color: '#f7931a80', logoUrl: getLogoUrl('token', 'btc') },
		{ label: 'ETH', color: '#627eea80', logoUrl: getLogoUrl('token', 'eth') }
	] as const;
</script>

<div class="vault-price-chart">
	<ChartContainer
		title="Share token price"
		timeSpanOptions={['1M', '3M', 'Max']}
		{loading}
		data={priceData}
		{formatValue}
		options={{ handleScroll: false, handleScale: false }}
	>
		{#snippet series({ data, timeSpan, range })}
			<AreaSeries
				{data}
				options={{ priceLineVisible: false, crosshairMarkerVisible: false }}
				priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
			/>

			{#if data.length > 1 && range}
				<CoinbaseBenchmarkSeries
					productId="BTC-USD"
					{data}
					timeBucket={timeSpan.timeBucket}
					{range}
					color="#f7931a80"
				/>
				<CoinbaseBenchmarkSeries
					productId="ETH-USD"
					{data}
					timeBucket={timeSpan.timeBucket}
					{range}
					color="#627eea80"
				/>
			{/if}

			<Series
				type={HistogramSeries}
				data={resampleTimeSeries(tvlData ?? [], timeSpan.interval)}
				options={{ priceLineVisible: false, color: 'transparent' }}
				paneIndex={1}
				priceScaleOptions={{ scaleMargins: { top: 0.25, bottom: 0 } }}
				callback={({ series, colors }) => {
					series.getPane().setHeight(150);
					series.applyOptions({ color: colors.box3 });
				}}
			>
				<SeriesLabel heading>TVL</SeriesLabel>
			</Series>
		{/snippet}

		{#snippet tooltip({ point, time }, [price, btcBenchmark, ethBenchmark, tvl])}
			{#if price || btcBenchmark || ethBenchmark || tvl}
				<ChartTooltip {point}>
					<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
					<dl class="tooltip-items">
						<dt>Price:</dt>
						<dd>{formatValue(price?.value)} {vault.denomination}</dd>
						<dt>BTC:</dt>
						<dd>{formatPercent(getBenchmarkPercentChange(btcBenchmark), 1, 1, { signDisplay: 'exceptZero' })}</dd>
						<dt>ETH:</dt>
						<dd>{formatPercent(getBenchmarkPercentChange(ethBenchmark), 1, 1, { signDisplay: 'exceptZero' })}</dd>
						<dt>TVL:</dt>
						<dd>{formatValue(tvl?.value)}</dd>
					</dl>
				</ChartTooltip>
			{/if}
		{/snippet}

		{#snippet footer()}
			<footer class="benchmark-legend" aria-label="Chart legend">
				{#each benchmarkLegend as benchmark}
					<div class="legend-item" style:--legend-color={benchmark.color}>
						<span class="legend-swatch" aria-hidden="true"></span>
						{#if benchmark.logoUrl}
							<img class="legend-logo" src={benchmark.logoUrl} alt="" aria-hidden="true" />
						{/if}
						<span>{benchmark.label}</span>
					</div>
				{/each}
			</footer>
		{/snippet}
	</ChartContainer>
</div>

<style>
	.vault-price-chart {
		margin-bottom: -0.25rem;

		:global([data-css-props]) {
			--chart-aspect-ratio: auto;
			--chart-height: 26rem;
		}

		.tooltip-date {
			margin-bottom: 0.75rem;
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-extra-light);
		}

		.tooltip-items {
			display: grid;
			grid-template-columns: auto auto;
			align-items: end;
			gap: 0.25rem 0.75rem;

			dt {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm, normal);
				color: var(--c-text-extra-light);
				text-transform: uppercase;
			}

			dd {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md, normal);
				color: var(--c-text);
			}
		}

		.benchmark-legend {
			margin-top: 0.75rem;
			margin-bottom: -0.25rem;
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem 1rem;
			justify-content: center;
		}

		.legend-item {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-extra-light);
		}

		.legend-logo {
			width: 1rem;
			height: 1rem;
			flex: 0 0 auto;
		}

		.legend-swatch {
			width: 1.5rem;
			height: 0;
			border-top: 2px solid var(--legend-color);
			border-radius: 999px;
		}
	}
</style>
