<!--
@component
Homepage adapter around the shared ECharts cumulative TVL / APY renderer.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import CumulativeTvlApyChart from '$lib/echarts/CumulativeTvlApyChart.svelte';
	import { buildCumulativeTvlPoints, getEligibleItems } from '$lib/echarts/cumulative-tvl-apy';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';
	import { isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import type { SlimVaultInfo } from '$lib/top-vaults/schemas';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';

	const MIN_TVL = 50_000;
	const MAX_APY_THRESHOLD = 10;

	interface Props {
		vaults: SlimVaultInfo[];
		savingsRate: number | null;
		treasuryRate: number | null;
	}

	let { vaults, savingsRate, treasuryRate }: Props = $props();

	function getCagr(vault: SlimVaultInfo): number | null {
		return vault.one_month_cagr_net ?? vault.one_month_cagr;
	}

	const benchmarkUrls = {
		treasury: resolve('/glossary/risk-free-rate'),
		savings: resolve('/glossary/fdic-national-rate')
	};

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
</script>

<CumulativeTvlApyChart
	points={chartPoints}
	{savingsRate}
	{treasuryRate}
	{benchmarkUrls}
	returnsAxisLabel="Returns (last month annualised)"
	returnsTooltipLabel="Returns annualised"
	chartHeightDesktop={500}
	chartHeightMobile={400}
	axisTitleFontSize={13}
	axisLabelFontSize={11}
	tooltipFontSize={13}
	gridDesktop={{ top: 64, right: 68, bottom: 64, left: 68 }}
	gridMobile={{ top: 46, right: 48, bottom: 48, left: 48 }}
	variant="glass"
	maxWidth="960px"
	className="echarts-ecosystem-chart"
/>
