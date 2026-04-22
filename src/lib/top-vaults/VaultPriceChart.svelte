<!--
@component
Render the vault share-price chart with TVL bars and benchmark overlays.

Perpetual futures vaults (Hyperliquid, GRVT, Lighter) show BTC/ETH benchmarks.
All other vaults show a US 3M T-bill (risk-free rate) benchmark instead.

Benchmark lines are rebased to the vault share price for the selected range
so relative performance is comparable on a single axis.
-->
<script lang="ts">
	import type { VaultInfo } from './schemas';
	import brandMark from '$lib/assets/brand-mark.svg';
	import usTreasuryLogo from '$lib/assets/logos/tokens/us-treasury.svg';
	import { HistogramSeries } from 'lightweight-charts';
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
	import type { PriceScaleCalculator } from '$lib/charts/types';
	import { formatDollar, formatInterestRate, formatPercent, formatTokenAmount } from '$lib/helpers/formatters';
	import { formatDate, resampleTimeSeries } from '$lib/charts/helpers';

	/** Scale the Y-axis to the vault share price with ±20% margin */
	const vaultPriceScaleCalculator: PriceScaleCalculator = (data) => {
		if (!data.length) return null;
		const values = data.map((d) => (d as { value: number }).value).filter((v) => v != null);
		if (!values.length) return null;
		const min = Math.min(...values);
		const max = Math.max(...values);
		const mid = (min + max) / 2;
		const margin = mid * 0.2;
		return { priceRange: { minValue: min - margin, maxValue: max + margin } };
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

	function getBenchmarkCustomValues(point: unknown) {
		if (!point || typeof point !== 'object' || !('customValues' in point)) return undefined;
		return (point as { customValues?: { percentChange?: number; usdPrice?: number } }).customValues;
	}

	function getTreasuryCustomValues(point: unknown) {
		if (!point || typeof point !== 'object' || !('customValues' in point)) return undefined;
		return (point as { customValues?: { percentChange?: number; annualRate?: number } }).customValues;
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

	type LegendItem = { label: string; color: string; logoUrl?: string; href?: string; tooltip?: string };

	const benchmarkLegend: LegendItem[] = $derived(
		showCryptoBenchmarks
			? [
					{ label: 'Vault', color: getVaultColor(vaultDirection), logoUrl: protocolLogoUrl ?? brandMark },
					{ label: 'BTC', color: '#f7931a80', logoUrl: getLogoUrl('token', 'btc') },
					{ label: 'ETH', color: '#627eea80', logoUrl: getLogoUrl('token', 'eth') }
				]
			: [
					{ label: 'Vault', color: getVaultColor(vaultDirection), logoUrl: protocolLogoUrl ?? brandMark },
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
			{#if data.length > 1 && range && !showCryptoBenchmarks}
				<TreasuryBenchmarkSeries {data} timeBucket={timeSpan.timeBucket} {range} color="#4a90d9a0" />
			{/if}

			<AreaSeries
				{data}
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
			{/if}
		{/snippet}

		{#snippet tooltip({ point, time }, seriesData)}
			{#if showCryptoBenchmarks}
				{@const price = seriesData[0]}
				{@const btc = getBenchmarkCustomValues(seriesData[1])}
				{@const eth = getBenchmarkCustomValues(seriesData[2])}
				{@const tvl = seriesData[3]}
				{#if price || btc || eth || tvl}
					<ChartTooltip {point}>
						<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
						<dl class="tooltip-items">
							<dt>Price:</dt>
							<dd>{formatValue(price?.value)} {vault.denomination}</dd>
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
							<dt>TVL:</dt>
							<dd>{formatValue(tvl?.value)}</dd>
						</dl>
					</ChartTooltip>
				{/if}
			{:else}
				{@const treasury = getTreasuryCustomValues(seriesData[0])}
				{@const price = seriesData[1]}
				{@const tvl = seriesData[2]}
				{#if price || treasury || tvl}
					<ChartTooltip {point}>
						<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
						<dl class="tooltip-items">
							<dt>Price:</dt>
							<dd>{formatValue(price?.value)} {vault.denomination}</dd>
							<dt>T-bill:</dt>
							<dd>
								{formatPercent(treasury?.percentChange, 1, 1, { signDisplay: 'exceptZero' })}
								{#if treasury?.annualRate != null}
									<span class="benchmark-usd">{formatInterestRate(treasury.annualRate)} p.a.</span>
								{/if}
							</dd>
							<dt>TVL:</dt>
							<dd>{formatValue(tvl?.value)}</dd>
						</dl>
					</ChartTooltip>
				{/if}
			{/if}
		{/snippet}

		{#snippet footer()}
			<footer class="benchmark-legend" aria-label="Chart legend">
				{#each benchmarkLegend as benchmark}
					{#if benchmark.tooltip}
						<Tooltip>
							<a slot="trigger" class="legend-item" style:--legend-color={benchmark.color} href={benchmark.href}>
								<span class="legend-swatch" aria-hidden="true"></span>
								{#if benchmark.logoUrl}
									<img class="legend-logo" src={benchmark.logoUrl} alt="" aria-hidden="true" />
								{/if}
								<span>{benchmark.label}</span>
							</a>
							<svelte:fragment slot="popup">
								<p>{benchmark.tooltip}</p>
								<p><a href={benchmark.href}>Click here for more information</a></p>
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
