<!--
@component
Render server-prepared vault equity curves and fixed-colour market benchmarks
on one TradingView lightweight-charts pane.

@example

```svelte
  <VaultEquityComparisonChart
    {vaults}
    {data}
    {enabledBenchmarks}
    returnMode="net"
    netAvailable
    missingFeeVaultNames={[]}
    {colours}
  />
```
-->
<script lang="ts">
	import { LineSeries, type LineData, type UTCTimestamp } from 'lightweight-charts';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import type { TimeSpan } from '$lib/charts/types';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Series from '$lib/charts/Series.svelte';
	import { formatDate } from '$lib/charts/helpers';
	import { formatNumber } from '$lib/helpers/formatters';
	import BenchmarkLogo from './BenchmarkLogo.svelte';
	import { benchmarkComparisonColours } from './colours';
	import { alignVisibleVaultCurves, getVisibleComparisonPoints, rebaseComparisonPoints } from './equity-curves';
	import { getComparisonVisibleRange, getNetComparisonPoints } from './net-returns';
	import type {
		ComparisonBenchmark,
		ComparisonChartPoint,
		ComparisonChartSeries,
		ComparisonReturnMode,
		ComparisonTimeBucket,
		ComparisonTimeSpan,
		ComparisonVault,
		VaultComparisonChartResponse
	} from './types';
	import { comparisonTimeSpanKeys } from './types';

	interface Props {
		vaults: ComparisonVault[];
		data?: VaultComparisonChartResponse;
		enabledBenchmarks: ComparisonBenchmark[];
		returnMode: ComparisonReturnMode;
		netAvailable: boolean;
		missingFeeVaultNames: string[];
		colours: ReadonlyMap<string, string>;
		loading?: boolean;
		selectedTimeSpan?: ComparisonTimeSpan;
		onTimeSpanChange?: (timeSpan: ComparisonTimeSpan) => void;
		onReturnModeChange?: (returnMode: ComparisonReturnMode) => void;
	}

	type ChartPointMeta = {
		kind: 'vault' | 'benchmark';
		id: string;
		label: string;
		colour: string;
		indexValue: number;
		benchmark?: ComparisonBenchmark;
		feeEvent?: 'after-entry' | 'before-exit' | 'after-exit';
	};

	type ComparisonChartPoint = LineData<UTCTimestamp> & { customValues: ChartPointMeta };

	let {
		vaults,
		data,
		enabledBenchmarks,
		returnMode,
		netAvailable,
		missingFeeVaultNames,
		colours,
		loading = false,
		selectedTimeSpan = '3M',
		onTimeSpanChange,
		onReturnModeChange
	}: Props = $props();
	let vaultById = $derived(new Map(vaults.map((vault) => [vault.id, vault])));
	let vaultSeries = $derived(data?.vaultSeries ?? []);
	let vaultSeriesById = $derived(new Map(vaultSeries.map((series) => [series.id, series])));
	let benchmarkSeriesById = $derived(new Map((data?.benchmarkSeries ?? []).map((series) => [series.id, series])));
	let rangeDriver = $derived(
		data?.range
			? ([
					[data.range[0], 100],
					[data.range[1], 100]
				] as [number, number][])
			: undefined
	);

	const benchmarkLabels: Record<ComparisonBenchmark, string> = {
		treasury: 'US 3M T-bill',
		eth: 'ETH',
		btc: 'BTC'
	};
	function buildChartPoints(
		series: ComparisonChartSeries | undefined,
		kind: ChartPointMeta['kind'],
		points: readonly ComparisonChartPoint[]
	): ComparisonChartPoint[] {
		if (!series) return [];
		const benchmark = kind === 'benchmark' ? (series.id as ComparisonBenchmark) : undefined;
		const label = benchmark ? benchmarkLabels[benchmark] : (vaultById.get(series.id)?.name ?? series.id);
		const colour = benchmark
			? benchmarkComparisonColours[benchmark]
			: (colours.get(series.id) ?? 'var(--c-text-light)');

		return points.map((point) => ({
			time: point.time as UTCTimestamp,
			value: point.value,
			customValues: {
				kind,
				id: series.id,
				label,
				colour,
				indexValue: point.value,
				benchmark,
				feeEvent: point.feeEvent
			}
		}));
	}

	function getChartSeriesPoints(
		series: ComparisonChartSeries | undefined,
		timeSpan: TimeSpan,
		kind: ChartPointMeta['kind'],
		visibleRange: [number, number] | null
	): ComparisonChartPoint[] {
		if (!series) return [];
		const points = series.points[timeSpan.timeBucket as ComparisonTimeBucket];
		const feeProfile = vaultById.get(series.id)?.feeProfile;
		return kind === 'vault' && returnMode === 'net' && feeProfile
			? getNetComparisonPoints(points, feeProfile, visibleRange)
			: getVisibleComparisonPoints(points, visibleRange);
	}

	function tooltipRows(points: unknown[]): ChartPointMeta[] {
		return points
			.flatMap((point) => {
				if (!point || typeof point !== 'object' || !('customValues' in point)) return [];
				const customValues = (point as { customValues?: ChartPointMeta }).customValues;
				return customValues ? [customValues] : [];
			})
			.toSorted((left, right) => Number(left.kind === 'benchmark') - Number(right.kind === 'benchmark'));
	}

	function feeEventLabel(feeEvent: NonNullable<ChartPointMeta['feeEvent']>): string {
		return {
			'after-entry': 'after entry fee',
			'before-exit': 'before exit fee',
			'after-exit': 'after exit fee'
		}[feeEvent];
	}
</script>

<div class="comparison-chart">
	<ChartContainer
		boxed
		data={rangeDriver}
		formatValue={(value) => formatNumber(value, 1)}
		timeSpanOptions={comparisonTimeSpanKeys}
		initialTimeSpan={selectedTimeSpan}
		onTimeSpanChange={(timeSpan) => onTimeSpanChange?.(timeSpan as ComparisonTimeSpan)}
		{loading}
		crosshairs
		options={{ handleScroll: false, handleScale: false }}
	>
		{#snippet title()}
			<div class="chart-title">
				<h2 aria-label="Returns index">
					<Tooltip>
						<span slot="trigger" class="chart-heading">Returns index</span>
						<svelte:fragment slot="popup">
							{#if returnMode === 'net'}
								Net estimates each vault's liquidation value after its known fees over the selected period. Management
								fees use starting invested capital, while performance fees apply to positive profit at each point.
								Internalised fees are already reflected in share prices. The earliest vault starts at 100; later vaults
								join at the highest overlapping vault curve. Benchmarks are unchanged by the fee calculation.
							{:else}
								Gross follows published vault share prices without additional investor-fee deductions. The earliest
								vault starts at 100; later vaults join at the highest overlapping vault curve.
							{/if}
						</svelte:fragment>
					</Tooltip>
				</h2>
				<fieldset class="return-mode" aria-label="Return mode">
					<label>
						<input
							type="radio"
							name="comparison-return-mode"
							checked={returnMode === 'gross'}
							onchange={() => onReturnModeChange?.('gross')}
						/>
						Gross
					</label>
					<label>
						<input
							type="radio"
							name="comparison-return-mode"
							checked={returnMode === 'net'}
							disabled={!netAvailable}
							onchange={() => onReturnModeChange?.('net')}
						/>
						Net
					</label>
					{#if !netAvailable}
						<span class="fee-help">
							<button
								class="fee-info"
								type="button"
								aria-label="Why Net returns are unavailable"
								aria-describedby="net-return-unavailable-description">?</button
							>
							<span class="fee-help-popup" id="net-return-unavailable-description" role="tooltip">
								<p>Net returns need full fee information for every selected vault.</p>
								<ul>
									{#each missingFeeVaultNames as vaultName, index (`${index}:${vaultName}`)}
										<li>{vaultName}</li>
									{/each}
								</ul>
							</span>
						</span>
					{/if}
				</fieldset>
			</div>
		{/snippet}

		{#snippet series({ timeSpan })}
			{@const visibleRange = getComparisonVisibleRange(data?.range, timeSpan)}
			{@const vaultPoints = alignVisibleVaultCurves(
				vaults.map((vault) => getChartSeriesPoints(vaultSeriesById.get(vault.id), timeSpan, 'vault', visibleRange))
			)}
			{@const benchmarkPoints = enabledBenchmarks.map((benchmark) =>
				rebaseComparisonPoints(
					getChartSeriesPoints(benchmarkSeriesById.get(benchmark), timeSpan, 'benchmark', visibleRange)
				)
			)}
			{#each vaults as vault, index (vault.id)}
				<Series
					type={LineSeries}
					data={buildChartPoints(vaultSeriesById.get(vault.id), 'vault', vaultPoints[index])}
					options={{
						color: colours.get(vault.id),
						lineWidth: 2,
						priceLineVisible: false,
						lastValueVisible: false,
						crosshairMarkerVisible: false
					}}
				/>
			{/each}

			{#each enabledBenchmarks as benchmark, index (benchmark)}
				<Series
					type={LineSeries}
					data={buildChartPoints(benchmarkSeriesById.get(benchmark), 'benchmark', benchmarkPoints[index])}
					options={{
						color: benchmarkComparisonColours[benchmark],
						lineWidth: 2,
						lineStyle: 2,
						priceLineVisible: false,
						lastValueVisible: false,
						crosshairMarkerVisible: false
					}}
				/>
			{/each}
		{/snippet}

		{#snippet tooltip({ point, time }, seriesData, timeSpan)}
			{@const rows = tooltipRows(seriesData)}
			{#if rows.length}
				<ChartTooltip {point}>
					<div class="tooltip-heading">{formatDate(time as number, timeSpan.timeBucket)}</div>
					<ul class="tooltip-rows">
						{#each rows as row (`${row.kind}:${row.id}`)}
							<li style:--series-colour={row.colour} title={row.label}>
								{#if row.kind === 'benchmark' && row.benchmark}
									<BenchmarkLogo benchmark={row.benchmark} />
								{:else}
									<span class="swatch" aria-hidden="true"></span>
								{/if}
								<span class="tooltip-label" class:vault-name={row.kind === 'vault'}>
									{row.label}{#if row.feeEvent}<small> · {feeEventLabel(row.feeEvent)}</small>{/if}
								</span>
								<strong>{formatNumber(row.indexValue, 1)}</strong>
							</li>
						{/each}
					</ul>
				</ChartTooltip>
			{/if}
		{/snippet}

		{#snippet footer()}
			<footer class="legend" aria-label="Equity comparison chart legend">
				{#each vaults as vault (vault.id)}
					<div class="legend-item" style:--series-colour={colours.get(vault.id)} title={vault.name}>
						<span class="swatch" aria-hidden="true"></span><span class="vault-name">{vault.name}</span>
					</div>
				{/each}
				{#each enabledBenchmarks as benchmark (benchmark)}
					<div
						class="legend-item"
						class:unavailable={data?.benchmarkErrors[benchmark]}
						style:--series-colour={benchmarkComparisonColours[benchmark]}
					>
						<BenchmarkLogo {benchmark} /><span>{benchmarkLabels[benchmark]}</span>
						{#if data?.benchmarkErrors[benchmark]}<small>Unavailable</small>{/if}
					</div>
				{/each}
			</footer>
		{/snippet}
	</ChartContainer>
</div>

<style>
	.comparison-chart {
		min-width: 0;

		.chart-title {
			display: grid;
			justify-items: start;
			gap: var(--space-xs);
		}

		.return-mode {
			display: inline-flex;
			align-items: center;
			gap: var(--space-xs);
			margin: 0;
			padding: 0;
			border: 0;
			font: var(--f-ui-sm-medium);
		}

		.return-mode label {
			display: inline-flex;
			align-items: center;
			gap: var(--space-xxs);
			cursor: pointer;
		}

		.return-mode label:has(input:disabled) {
			opacity: 0.55;
			cursor: not-allowed;
		}

		.fee-info {
			display: grid;
			width: 1.25rem;
			height: 1.25rem;
			place-items: center;
			padding: 0;
			border: 1px solid var(--c-box-4);
			border-radius: 50%;
			background: transparent;
			color: var(--c-text-light);
			font: var(--f-ui-xs-bold);
			cursor: help;
		}

		.fee-help {
			position: relative;
			display: inline-flex;
		}

		.fee-help-popup {
			display: none;
			position: absolute;
			top: calc(100% + var(--space-xxs));
			left: 0;
			z-index: 10000;
			width: max-content;
			max-width: min(18rem, calc(100vw - 2rem));
			padding: var(--space-sm);
			border: 1px solid var(--c-box-3);
			border-radius: var(--radius-ms);
			background: var(--c-text-inverted);
			box-shadow: var(--shadow-3);
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--ls-ui-sm);
			color: var(--c-text);

			p {
				margin: 0;
			}

			ul {
				margin: var(--space-xs) 0 0;
				padding-left: var(--space-md);
			}
		}

		.fee-help:hover .fee-help-popup,
		.fee-help:focus-within .fee-help-popup {
			display: block;
		}

		:global(.chart-container > .tv-chart) {
			width: calc(100% - var(--chart-container-padding) - var(--chart-container-padding));
			margin-inline: var(--chart-container-padding);
		}

		:global(.chart-tooltip) {
			background: var(--c-text-inverted);
		}

		@media (--viewport-xs) {
			:global(.chart-container > header) {
				grid-template-columns: 1fr;
				gap: var(--space-sm);
			}

			:global(.chart-container > header .segmented-control) {
				width: 100%;
			}
		}

		:global([data-css-props]) {
			--chart-aspect-ratio: auto;
			--chart-height: 31rem;
		}

		h2 {
			font: var(--f-heading-md-medium);
		}

		.chart-heading {
			border-bottom: 1px dashed var(--c-text-light);
		}
	}

	.tooltip-heading {
		margin: 0 0 var(--space-sm);
		font: var(--f-ui-sm-bold);
		letter-spacing: var(--ls-ui-sm);
		color: var(--c-text);
	}

	.tooltip-rows {
		display: grid;
		gap: var(--space-xs);
		min-width: 13rem;
		max-width: min(23rem, 70vw);
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			display: grid;
			grid-template-columns: auto minmax(0, 1fr) auto;
			gap: var(--space-xs);
			align-items: center;
		}
	}

	.tooltip-label,
	.legend-item span:last-of-type {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tooltip-label small {
		color: var(--c-text-extra-light);
		font: inherit;
	}

	.vault-name {
		color: var(--c-text);
	}

	.swatch {
		display: block;
		width: 1.25rem;
		height: 0;
		border-top: 2px solid var(--series-colour);
		border-radius: 999px;
	}

	.legend {
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-sm) var(--space-md);
		width: 100%;
		margin-top: var(--space-md);
		padding-inline: var(--chart-container-padding);
	}

	.legend-item {
		display: inline-grid;
		grid-template-columns: auto minmax(0, auto) auto;
		gap: var(--space-xs);
		align-items: center;
		max-width: 18rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);

		&.unavailable {
			opacity: 0.6;
		}

		small {
			color: var(--c-error);
		}
	}

	@media (--viewport-xs) {
		.comparison-chart :global([data-css-props]) {
			--chart-height: 26rem;
		}
	}
</style>
