<!--
@component
Render the vault share-price chart with TVL bars and benchmark overlays.

Perpetual futures vaults (Hyperliquid, GRVT, Lighter) show BTC/ETH benchmarks
and an underwater drawdown pane (equity curve tearsheet style).
All other vaults show a US 3M T-bill (risk-free rate) benchmark instead.

Benchmark lines are rebased to the vault share price for the selected range
so relative performance is comparable on a single axis.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { VaultInfo } from './schemas';
	import brandMark from '$lib/assets/brand-mark.svg';
	import usTreasuryLogo from '$lib/assets/logos/tokens/us-treasury.svg';
	import { BaselineSeries as BaselineSeriesType, HistogramSeries } from 'lightweight-charts';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import CoinbaseBenchmarkSeries from './CoinbaseBenchmarkSeries.svelte';
	import TreasuryBenchmarkSeries from './TreasuryBenchmarkSeries.svelte';
	import Series from '$lib/charts/Series.svelte';
	import SeriesLabel from '$lib/charts/SeriesLabel.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { isPerpetualFuturesVault } from './isPerpetualFuturesVault';
	import type { PriceScaleCalculator, SimpleDataItem } from '$lib/charts/types';
	import {
		formatDollar,
		formatInterestRate,
		formatPercent,
		formatTokenAmount,
		notFilledMarker
	} from '$lib/helpers/formatters';
	import { annualizedReturn } from '$lib/helpers/financial';
	import { formatDate, resampleTimeSeries } from '$lib/charts/helpers';
	const TRAILING_RETURN_DAYS = 30;
	const TRAILING_RETURN_SECONDS = TRAILING_RETURN_DAYS * 86_400;

	/** Let lightweight-charts auto-scale to the vault share price only (benchmarks excluded via priceScaleCalculator={() => null}) */
	const vaultPriceScaleCalculator: PriceScaleCalculator = (data) => {
		if (!data.length) return null;
		const values = data.map((d) => (d as { value: number }).value).filter((v) => v != null);
		if (!values.length) return null;
		const min = Math.min(...values);
		const max = Math.max(...values);
		return { priceRange: { minValue: min, maxValue: max } };
	};

	interface Props {
		vault: VaultInfo;
		/** Optional protocol logo URL to use instead of Trading Strategy brand mark */
		protocolLogoUrl?: string;
	}

	let { vault, protocolLogoUrl }: Props = $props();

	let showCryptoBenchmarks = $derived(isPerpetualFuturesVault(vault));

	let loading = $state(true);
	let priceData = $state<[number, number][]>();
	let tvlData = $state<[number, number][]>();

	type ChartSeriesKind = 'vault-price' | 'drawdown' | 'tvl';
	type ChartSeriesPoint = {
		value: number;
		customValues?: { annualizedReturn?: number; series?: ChartSeriesKind; period?: string };
	};

	function withChartSeriesKind(data: SimpleDataItem[], series: ChartSeriesKind) {
		let lookbackIndex = 0;

		return data.map((item, index) => {
			const lookbackTime = item.time - TRAILING_RETURN_SECONDS;
			while (lookbackIndex < index - 1 && data[lookbackIndex + 1].time <= lookbackTime) {
				lookbackIndex++;
			}

			const lookbackPoint =
				series === 'vault-price' && data[lookbackIndex]?.time <= lookbackTime ? data[lookbackIndex] : undefined;
			const returnRate = lookbackPoint && lookbackPoint.value > 0 ? item.value / lookbackPoint.value - 1 : undefined;
			const itemDate = item.time * 1000;
			const lookbackDate = lookbackPoint ? lookbackPoint.time * 1000 : undefined;
			const annualized =
				series === 'vault-price' && returnRate != null && lookbackDate != null && itemDate > lookbackDate
					? annualizedReturn(lookbackDate, itemDate, returnRate)
					: undefined;

			return { ...item, customValues: { ...item.customValues, annualizedReturn: annualized, series } };
		});
	}

	function getBenchmarkCustomValues(point: unknown) {
		if (!point || typeof point !== 'object' || !('customValues' in point)) return undefined;
		return (point as { customValues?: { percentChange?: number; usdPrice?: number } }).customValues;
	}

	function getTreasuryCustomValues(point: unknown) {
		if (!point || typeof point !== 'object' || !('customValues' in point)) return undefined;
		const customValues = (
			point as { customValues?: { percentChange?: number; annualRate?: number; rateDate?: number } }
		).customValues;
		return customValues?.annualRate != null || customValues?.rateDate != null ? customValues : undefined;
	}

	function getSeriesValuePoint(points: unknown[], series: ChartSeriesKind) {
		return points.find((point) => {
			if (!point || typeof point !== 'object' || !('value' in point)) return false;
			const item = point as { value?: unknown; customValues?: { series?: unknown } };
			return typeof item.value === 'number' && item.customValues?.series === series;
		}) as ChartSeriesPoint | undefined;
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

	let vaultDirection = $state(0);

	function getVaultColor(direction: number) {
		if (direction < 0) return 'var(--c-bearish)';
		if (direction > 0) return 'var(--c-bullish)';
		return 'var(--c-text-ultra-light)';
	}

	type LegendItem = {
		label: string;
		color: string;
		logoUrl?: string;
		href?: '/glossary/risk-free-rate';
		tooltip?: string;
	};

	const benchmarkLegend: LegendItem[] = $derived(
		showCryptoBenchmarks
			? [
					{ label: vault.name, color: getVaultColor(vaultDirection), logoUrl: protocolLogoUrl ?? brandMark },
					{ label: 'BTC', color: '#f7931a80', logoUrl: getLogoUrl('token', 'btc') },
					{ label: 'ETH', color: '#627eea80', logoUrl: getLogoUrl('token', 'eth') }
				]
			: [
					{ label: vault.name, color: getVaultColor(vaultDirection), logoUrl: protocolLogoUrl ?? brandMark },
					{
						label: 'US 3M T-bill',
						color: '#4a90d9a0',
						logoUrl: usTreasuryLogo,
						href: '/glossary/risk-free-rate',
						tooltip: 'Risk-free rate: Equivalent investment to U.S. Treasury notes.'
					}
				]
	);
</script>

<div class={['vault-price-chart', showCryptoBenchmarks && 'has-drawdown']}>
	<ChartContainer
		title="Share token price"
		timeSpanOptions={['1M', '3M', 'Max']}
		{loading}
		data={priceData}
		{formatValue}
		options={{
			handleScroll: false,
			handleScale: false,
			...(showCryptoBenchmarks && {
				localization: { priceFormatter: (v: number) => (v >= -1 && v < 0 ? formatPercent(v, 1) : formatValue(v)) }
			})
		}}
	>
		{#snippet series({ data, timeSpan, range })}
			{@const vaultSeriesData = withChartSeriesKind(data, 'vault-price')}
			{@const tvlSeriesData = withChartSeriesKind(resampleTimeSeries(tvlData ?? [], timeSpan.interval), 'tvl')}

			<AreaSeries
				data={vaultSeriesData}
				options={{ priceLineVisible: false, crosshairMarkerVisible: false }}
				priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
				priceScaleCalculator={vaultPriceScaleCalculator}
				onVisibleDataChange={(_, profitInfo) => (vaultDirection = profitInfo.direction)}
			/>

			{#if data.length > 1 && range}
				{#if showCryptoBenchmarks}
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

					{@const ddPeriod = !timeSpan.spanDays ? 'All-time' : timeSpan.spanDays <= 30 ? '1M' : '3M'}
					{@const drawdownSeriesData = (() => {
						let peak = -Infinity;
						return data.map((item) => {
							if (item.value > peak) peak = item.value;
							const dd = peak > 0 ? (item.value - peak) / peak : 0;
							return { time: item.time, value: dd, customValues: { series: 'drawdown' as const, period: ddPeriod } };
						});
					})()}
					<Series
						type={BaselineSeriesType}
						data={drawdownSeriesData}
						options={{
							baseValue: { type: 'price', price: 0 },
							priceLineVisible: false,
							crosshairMarkerVisible: false,
							lineWidth: 1
						}}
						paneIndex={1}
						priceScaleOptions={{ scaleMargins: { top: 0, bottom: 0.1 } }}
						callback={({ series, colors }) => {
							series.getPane().setHeight(120);
							series.applyOptions({
								topLineColor: 'transparent',
								topFillColor1: 'transparent',
								topFillColor2: 'transparent',
								bottomLineColor: '#c0392b',
								bottomFillColor1: 'rgba(192, 57, 43, 0.25)',
								bottomFillColor2: 'rgba(192, 57, 43, 0.25)'
							});
						}}
					>
						<SeriesLabel heading>Drawdown</SeriesLabel>
					</Series>
				{:else}
					<TreasuryBenchmarkSeries {data} timeBucket={timeSpan.timeBucket} {range} color="#4a90d9a0" />
				{/if}

				<Series
					type={HistogramSeries}
					data={tvlSeriesData}
					options={{ priceLineVisible: false, color: 'transparent' }}
					paneIndex={showCryptoBenchmarks ? 2 : 1}
					priceScaleOptions={{ scaleMargins: { top: 0.25, bottom: 0 } }}
					callback={({ series, colors }) => {
						series.getPane().setHeight(150);
						series.applyOptions({ color: colors.box3 });
					}}
				>
					<SeriesLabel heading>TVL</SeriesLabel>
				</Series>
			{/if}
		{/snippet}

		{#snippet tooltip({ point, time }, seriesData)}
			{#if showCryptoBenchmarks}
				{@const price = getSeriesValuePoint(seriesData, 'vault-price')}
				{@const btc = getBenchmarkCustomValues(seriesData[1])}
				{@const eth = getBenchmarkCustomValues(seriesData[2])}
				{@const drawdown = getSeriesValuePoint(seriesData, 'drawdown')}
				{@const tvl = getSeriesValuePoint(seriesData, 'tvl')}
				{#if price || btc || eth || tvl}
					<ChartTooltip {point}>
						<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
						<dl class="tooltip-items">
							<dt>1M ann return:</dt>
							<dd>{formatPercent(price?.customValues?.annualizedReturn, 1, 1, { signDisplay: 'exceptZero' })}</dd>
							<dt>Price:</dt>
							<dd>{price ? formatValue(price.value) : notFilledMarker} {vault.denomination}</dd>
							<dt>BTC:</dt>
							<dd>
								{formatPercent(btc?.percentChange, 1, 1, { signDisplay: 'exceptZero' })}
								{#if btc?.usdPrice}<span class="benchmark-usd">{formatDollar(btc.usdPrice, 1)}</span>{/if}
							</dd>
							<dt>ETH:</dt>
							<dd>
								{formatPercent(eth?.percentChange, 1, 1, { signDisplay: 'exceptZero' })}
								{#if eth?.usdPrice}<span class="benchmark-usd">{formatDollar(eth.usdPrice, 1)}</span>{/if}
							</dd>
							<dt>Drawdown {drawdown?.customValues?.period ?? ''}:</dt>
							<dd>{formatPercent(drawdown?.value, 2, 2)}</dd>
							<dt>TVL:</dt>
							<dd>{tvl ? formatValue(tvl.value) : notFilledMarker}</dd>
						</dl>
					</ChartTooltip>
				{/if}
			{:else}
				{@const treasury = seriesData.map(getTreasuryCustomValues).find(Boolean)}
				{@const price = getSeriesValuePoint(seriesData, 'vault-price')}
				{@const tvl = getSeriesValuePoint(seriesData, 'tvl')}
				{#if price || treasury || tvl}
					<ChartTooltip {point}>
						<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
						<dl class="tooltip-items">
							<dt>1M ann return:</dt>
							<dd>{formatPercent(price?.customValues?.annualizedReturn, 1, 1, { signDisplay: 'exceptZero' })}</dd>
							<dt>Price:</dt>
							<dd>{price ? formatValue(price.value) : notFilledMarker} {vault.denomination}</dd>
							<dt>TVL:</dt>
							<dd>{tvl ? formatValue(tvl.value) : notFilledMarker}</dd>
						</dl>
						{#if treasury}
							<dl class="tooltip-items tooltip-items-secondary">
								<dt>T-bill ann return:</dt>
								<dd>{formatInterestRate(treasury.annualRate)}</dd>
								{#if treasury.rateDate != null}
									<dt>Rate date:</dt>
									<dd>{formatDate(treasury.rateDate, '1d')}</dd>
								{/if}
								<dt>T-bill earned:</dt>
								<dd>{formatPercent(treasury.percentChange, 1, 1, { signDisplay: 'exceptZero' })}</dd>
							</dl>
						{/if}
					</ChartTooltip>
				{/if}
			{/if}
		{/snippet}

		{#snippet footer()}
			<footer class="benchmark-legend" aria-label="Chart legend">
				{#each benchmarkLegend as benchmark (benchmark.label)}
					{#if benchmark.tooltip}
						<Tooltip>
							<a
								slot="trigger"
								class="legend-item"
								style:--legend-color={benchmark.color}
								href={resolve(benchmark.href ?? '/')}
							>
								<span class="legend-swatch" aria-hidden="true"></span>
								{#if benchmark.logoUrl}
									<img class="legend-logo" src={benchmark.logoUrl} alt="" aria-hidden="true" />
								{/if}
								<span>{benchmark.label}</span>
							</a>
							<svelte:fragment slot="popup">
								<p>{benchmark.tooltip}</p>
								<p>
									<a href={resolve(benchmark.href ?? '/')}>Click here for more information</a>
								</p>
							</svelte:fragment>
						</Tooltip>
					{:else}
						<div class="legend-item" style:--legend-color={benchmark.color}>
							<span class="legend-swatch" aria-hidden="true"></span>
							{#if benchmark.logoUrl}
								<img class="legend-logo" src={benchmark.logoUrl} alt="" aria-hidden="true" />
							{/if}
							<span>{benchmark.label}</span>
						</div>
					{/if}
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

		&.has-drawdown :global([data-css-props]) {
			--chart-height: 34rem;
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

			.benchmark-usd {
				margin-left: 0.25rem;
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm, normal);
				color: var(--c-text-extra-light);
			}

			&.tooltip-items-secondary {
				margin-top: 0.75rem;
				padding-top: 0.75rem;
				border-top: 1px solid var(--c-box-3);

				dt,
				dd,
				.benchmark-usd {
					font-size: 80%;
				}
			}
		}

		.benchmark-legend {
			margin-top: 0.75rem;
			margin-bottom: -0.25rem;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 0.75rem 1rem;
			justify-content: center;

			:global(.tooltip) {
				display: inline-flex;
				align-items: center;
			}

			:global(.tooltip .trigger) {
				display: inline-flex;
				align-items: center;
			}
		}

		.legend-item {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-extra-light);
			text-decoration: none;
		}

		.legend-logo {
			width: 1.25rem;
			height: 1.25rem;
			flex: 0 0 auto;
			object-fit: contain;
		}

		.legend-swatch {
			width: 1.5rem;
			height: 0;
			border-top: 2px solid var(--legend-color);
			border-radius: 999px;
		}
	}
</style>
