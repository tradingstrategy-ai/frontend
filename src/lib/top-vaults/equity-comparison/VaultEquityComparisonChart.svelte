<!--
@component
Render server-prepared vault equity curves and fixed-colour market benchmarks
on one TradingView lightweight-charts pane.

@example

```svelte
  <VaultEquityComparisonChart {vaults} {data} {enabledBenchmarks} {colours} />
```
-->
<script lang="ts">
	import { LineSeries, type LineData, type UTCTimestamp } from 'lightweight-charts';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Series from '$lib/charts/Series.svelte';
	import { formatDate } from '$lib/charts/helpers';
	import { formatNumber } from '$lib/helpers/formatters';
	import { benchmarkComparisonColours } from './colours';
	import type {
		ComparisonBenchmark,
		ComparisonChartSeries,
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
		colours: ReadonlyMap<string, string>;
		loading?: boolean;
		selectedTimeSpan?: ComparisonTimeSpan;
		onTimeSpanChange?: (timeSpan: ComparisonTimeSpan) => void;
	}

	type ChartPointMeta = {
		kind: 'vault' | 'benchmark';
		id: string;
		label: string;
		colour: string;
		indexValue: number;
		discontinuous?: boolean;
	};

	type ComparisonChartPoint = LineData<UTCTimestamp> & { customValues: ChartPointMeta };

	let {
		vaults,
		data,
		enabledBenchmarks,
		colours,
		loading = false,
		selectedTimeSpan = '3M',
		onTimeSpanChange
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
		timeBucket: ComparisonTimeBucket,
		kind: ChartPointMeta['kind']
	): ComparisonChartPoint[] {
		if (!series) return [];
		const benchmark = kind === 'benchmark' ? (series.id as ComparisonBenchmark) : undefined;
		const label = benchmark ? benchmarkLabels[benchmark] : (vaultById.get(series.id)?.name ?? series.id);
		const colour = benchmark
			? benchmarkComparisonColours[benchmark]
			: (colours.get(series.id) ?? 'var(--c-text-light)');

		return series.points[timeBucket].map((point) => ({
			time: point.time as UTCTimestamp,
			value: point.value,
			customValues: {
				kind,
				id: series.id,
				label,
				colour,
				indexValue: point.value,
				discontinuous: series.discontinuous
			}
		}));
	}

	function tooltipRows(points: unknown[]): ChartPointMeta[] {
		return points.flatMap((point) => {
			if (!point || typeof point !== 'object' || !('customValues' in point)) return [];
			const customValues = (point as { customValues?: ChartPointMeta }).customValues;
			return customValues ? [customValues] : [];
		});
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
			<h2 aria-label="Vault returns index">
				<Tooltip>
					<span slot="trigger" class="chart-heading">Vault returns index</span>
					<svelte:fragment slot="popup">
						Oldest vault starts at 100; younger vaults join at the highest overlapping curve.
					</svelte:fragment>
				</Tooltip>
			</h2>
		{/snippet}

		{#snippet series({ timeSpan })}
			{@const timeBucket = timeSpan.timeBucket as ComparisonTimeBucket}
			{#each vaults as vault (vault.id)}
				<Series
					type={LineSeries}
					data={buildChartPoints(vaultSeriesById.get(vault.id), timeBucket, 'vault')}
					options={{
						color: colours.get(vault.id),
						lineWidth: 2,
						priceLineVisible: false,
						lastValueVisible: false,
						crosshairMarkerVisible: false
					}}
				/>
			{/each}

			{#each enabledBenchmarks as benchmark (benchmark)}
				<Series
					type={LineSeries}
					data={buildChartPoints(benchmarkSeriesById.get(benchmark), timeBucket, 'benchmark')}
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
					<div class="tooltip-date">{formatDate(time as number, timeSpan.timeBucket)}</div>
					<ul class="tooltip-rows">
						{#each rows as row (`${row.kind}:${row.id}`)}
							<li style:--series-colour={row.colour} title={row.label}>
								<span class="swatch" aria-hidden="true"></span>
								<span class="tooltip-label" class:vault-name={row.kind === 'vault'}>
									{row.label}{#if row.discontinuous}<small> · no overlap</small>{/if}
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
						{#if vaultSeriesById.get(vault.id)?.discontinuous}<small>No overlap</small>{/if}
					</div>
				{/each}
				{#each enabledBenchmarks as benchmark (benchmark)}
					<div
						class="legend-item"
						class:unavailable={data?.benchmarkErrors[benchmark]}
						style:--series-colour={benchmarkComparisonColours[benchmark]}
					>
						<span class="swatch" aria-hidden="true"></span><span>{benchmarkLabels[benchmark]}</span>
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

	.tooltip-date {
		margin-bottom: var(--space-sm);
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-bold);
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
