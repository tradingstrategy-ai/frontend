<!--
@component
Wrapper for the reusable historical TVL chart configured for chain groupings.

@example

```svelte
	<HistoricalTvlChainChart data={chartData} dataLoading={loading} error={error} />
```
-->
<script lang="ts">
	import HistoricalTvlGroupChart from '$lib/echarts/HistoricalTvlGroupChart.svelte';
	import type { HistoricalTvlByChainPayload, HistoricalTvlSeriesBase } from '$lib/echarts/historical-tvl';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';

	interface Props {
		data: HistoricalTvlByChainPayload | null;
		dataLoading?: boolean;
		error?: string | null;
	}

	let { data, dataLoading = false, error = null }: Props = $props();

	function getSeriesLogoUrl(series: HistoricalTvlSeriesBase) {
		if (!('chainIds' in series)) return undefined;
		const chainSlug = series.chainIds.map((chainId) => getChain(chainId)?.slug).find(Boolean);
		return getLogoUrl('blockchain', chainSlug);
	}
</script>

<div class="standalone-historical-tvl-chain-shell">
	<HistoricalTvlGroupChart
		{data}
		{dataLoading}
		{error}
		searchParamKey="chains"
		selectorLabel="Chain"
		selectorLabelPlural="chains"
		{getSeriesLogoUrl}
	/>
	{#if data && !dataLoading && !error}
		<!-- Server-side weekly aggregation took 1222ms from the Parquet dataset using weekly averages of daily closes. Cached for 24 hours. Includes 3404 non-blacklisted vaults; excluded 212 blacklisted vaults and 265 outlier weekly points. -->
	{/if}
</div>
