<script lang="ts">
	import type { VaultInfo } from './schemas';
	import { HistogramSeries } from 'lightweight-charts';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import Series from '$lib/charts/Series.svelte';
	import SeriesLabel from '$lib/charts/SeriesLabel.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import { getTimeSeries } from './metrics.remote';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import { formatDate, resampleTimeSeries } from '$lib/charts/helpers';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let vaultData = $derived(getTimeSeries(vault.id));

	const formatValue = (v: number) => formatTokenAmount(v, 2);
</script>

<div class="vault-price-chart">
	<ChartContainer
		title="Share token price"
		timeSpanOptions={['1M', '3M', 'Max']}
		loading={vaultData.loading}
		data={vaultData.current?.price}
		{formatValue}
		options={{ handleScroll: false, handleScale: false }}
	>
		{#snippet series({ data, timeSpan })}
			<AreaSeries
				{data}
				options={{ priceLineVisible: false, crosshairMarkerVisible: false }}
				priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
			/>

			<Series
				type={HistogramSeries}
				data={resampleTimeSeries(vaultData.current?.tvl ?? [], timeSpan.interval)}
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

		{#snippet tooltip({ point, time }, [price, tvl])}
			{#if price || tvl}
				<ChartTooltip {point}>
					<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
					<dl class="tooltip-items">
						<dt>Price:</dt>
						<dd>{formatValue(price?.value)} {vault.denomination}</dd>
						<dt>TVL:</dt>
						<dd>{formatValue(tvl?.value)}</dd>
					</dl>
				</ChartTooltip>
			{/if}
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
	}
</style>
