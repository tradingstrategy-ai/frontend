<!--
@component
Two-column header for stablecoin detail pages. Left column shows the expandable
description; right column shows a compact cumulative TVL/APY chart filtered to
the stablecoin's vaults. The chart is hidden on mobile.

@example
```svelte
  <StablecoinDetailHeader metadata={stablecoinMetadata} vaults={topVaults.vaults} />
```
-->
<script lang="ts">
	import type { StablecoinMetadata } from './schemas';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import StablecoinDescription from './StablecoinDescription.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import CumulativeTvlApyChart from '$lib/echarts/CumulativeTvlApyChart.svelte';
	import { buildCumulativeTvlPoints, getEligibleItems } from '$lib/echarts/cumulative-tvl-apy';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';
	import { isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';

	const MIN_TVL = 10_000;
	const MAX_APY_THRESHOLD = 10;

	interface Props {
		metadata: StablecoinMetadata;
		vaults: VaultInfo[];
	}

	let { metadata, vaults }: Props = $props();

	function getCagr(vault: VaultInfo): number | null {
		return vault.one_month_cagr_net ?? vault.one_month_cagr;
	}

	let eligibleVaults = $derived(
		getEligibleItems(vaults, {
			getApy: getCagr,
			getTvl: (vault) => vault.current_nav,
			isBlacklisted,
			minTvl: MIN_TVL,
			maxApyThreshold: MAX_APY_THRESHOLD
		})
	);

	let chartPoints = $derived(
		buildCumulativeTvlPoints(
			eligibleVaults.map((vault) => ({
				name: vault.name,
				chain: vault.chain ?? 'Unknown',
				chainLogoUrl: getLogoUrl('blockchain', getChain(vault.chain_id)?.slug),
				protocol: vault.protocol ?? 'Unknown',
				protocolLogoUrl: getVaultProtocolLogoUrl(vault.protocol_slug),
				realApy: (getCagr(vault) ?? 0) * 100,
				individualTvl: vault.current_nav ?? 0,
				url: resolveVaultDetails(vault)
			}))
		)
	);

	let benchmarkUrls = { treasury: '', savings: '' };
</script>

<div class="stablecoin-detail-header">
	<div class="description-column">
		<StablecoinDescription {metadata} />
	</div>

	<div class="chart-column">
		<MetricsBox title="Current TVL and profit in {metadata.symbol} vaults">
			<CumulativeTvlApyChart
				points={chartPoints}
				savingsRate={null}
				treasuryRate={null}
				{benchmarkUrls}
				showVaultSymbols={false}
				invisibleVaultHoverSymbolSize={14}
				returnsAxisLabel="Returns (1M ann.)"
				returnsTooltipLabel="Returns annualised"
				yAxisLabel="{metadata.symbol} vault TVL"
				chartHeightDesktop={260}
				chartHeightMobile={260}
				axisTitleFontSize={11}
				axisLabelFontSize={10}
				tooltipFontSize={12}
				gridDesktop={{ top: 16, right: 48, bottom: 40, left: 48 }}
				gridMobile={{ top: 16, right: 40, bottom: 36, left: 40 }}
				variant="plain"
			/>
		</MetricsBox>
	</div>
</div>

<style>
	.stablecoin-detail-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		align-items: stretch;

		.description-column :global(.metrics-box) {
			height: 100%;
		}

		.chart-column :global(.metrics-box) {
			height: 100%;
		}

		.chart-column :global(.echarts-cumulative-tvl-apy-chart) {
			min-height: unset;
		}

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;

			.chart-column {
				display: none;
			}
		}
	}
</style>
