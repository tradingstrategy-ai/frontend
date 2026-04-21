<!--
@component
Render the vault utilisation chart for lending protocol vaults (Morpho, Euler, Silo Finance, etc.).

Only renders if the vault has utilisation data available in the metrics endpoint.
Utilisation values above 100% are possible for some lending protocols.

The chart is coloured green below 80% utilisation and red above, with a dashed
separator line at the 80% threshold.

@example

```svelte
  <VaultUtilisationChart {vault} />
```
-->
<script lang="ts">
	import type { VaultInfo } from './schemas';
	import { BaselineSeries } from 'lightweight-charts';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import ChartContainer from '$lib/charts/ChartContainer.svelte';
	import Series from '$lib/charts/Series.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import { formatDate } from '$lib/charts/helpers';
	import { formatPercent } from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let loading = $state(true);
	let utilisationData = $state<[number, number][] | undefined>();

	async function fetchMetrics(vaultId: string) {
		loading = true;
		utilisationData = undefined;
		try {
			const resp = await fetch(`/trading-view/vaults/${vaultId}/metrics`);
			const data = await resp.json();
			utilisationData = data.utilisation;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		fetchMetrics(vault.id);
	});

	const formatValue = (v: number) => formatPercent(v, 1);
</script>

{#if utilisationData === undefined || utilisationData.length > 0}
	<MetricsBox>
		<div class="vault-utilisation-chart">
			<ChartContainer
				title="Utilisation"
				timeSpanOptions={['1M', '3M', 'Max']}
				{loading}
				data={utilisationData}
				{formatValue}
				options={{ handleScroll: false, handleScale: false }}
			>
				{#snippet series({ data })}
					<Series
						type={BaselineSeries}
						{data}
						options={{
							baseValue: { type: 'price', price: 0.8 },
							priceLineVisible: false,
							crosshairMarkerVisible: false,
							lineWidth: 2
						}}
						priceScaleOptions={{ scaleMargins: { top: 0.1, bottom: 0.1 } }}
						callback={({ series, colors }) => {
							series.applyOptions({
								topLineColor: colors.bearish,
								topFillColor1: colors.bearish30,
								topFillColor2: colors.bearish0,
								bottomLineColor: colors.bullish,
								bottomFillColor1: colors.bullish0,
								bottomFillColor2: colors.bullish30
							});
							series.createPriceLine({
								price: 0.8,
								color: colors.neutral30,
								lineWidth: 1,
								lineStyle: 2,
								axisLabelVisible: false
							});
						}}
					/>
				{/snippet}

				{#snippet tooltip({ point, time }, [utilisation])}
					{#if utilisation}
						<ChartTooltip {point}>
							<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
							<dl class="tooltip-items">
								<dt>Utilisation:</dt>
								<dd>{formatValue(utilisation.value)}</dd>
							</dl>
							<p class="tooltip-explanation">
								For lending based vaults, utilisation tells how much capital is borrowed out. It will affect the
								interest rate and availability of redemptions.
							</p>
						</ChartTooltip>
					{/if}
				{/snippet}
			</ChartContainer>
		</div>
	</MetricsBox>
{/if}

<style>
	.vault-utilisation-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: auto;
			--chart-height: 12rem;
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

		.tooltip-explanation {
			margin-top: 0.75rem;
			max-width: 16rem;
			white-space: normal;
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-extra-light);
		}
	}
</style>
