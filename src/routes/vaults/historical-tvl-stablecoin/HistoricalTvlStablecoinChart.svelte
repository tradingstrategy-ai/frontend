<!--
@component
Wrapper for the reusable historical TVL chart configured for stablecoin groupings.

@example

```svelte
	<HistoricalTvlStablecoinChart data={chartData} dataLoading={loading} error={error} />
```
-->
<script lang="ts">
	import HistoricalTvlGroupChart from '$lib/echarts/HistoricalTvlGroupChart.svelte';
	import type { HistoricalTvlByStablecoinPayload, HistoricalTvlByStablecoinSeries } from '$lib/echarts/historical-tvl';
	import { getStablecoinLogoUrl } from '$lib/stablecoin-metadata/helpers';

	interface Props {
		data: HistoricalTvlByStablecoinPayload | null;
		dataLoading?: boolean;
		error?: string | null;
	}

	let { data, dataLoading = false, error = null }: Props = $props();

	function getSeriesLogoUrl(series: HistoricalTvlByStablecoinSeries) {
		return getStablecoinLogoUrl(series.stablecoinSlug);
	}
</script>

<div class="standalone-historical-tvl-stablecoin-shell">
	<HistoricalTvlGroupChart
		{data}
		{dataLoading}
		{error}
		searchParamKey="stablecoins"
		selectorLabel="Stablecoin"
		selectorLabelPlural="stablecoins"
		watermarkCorner="top-left"
		{getSeriesLogoUrl}
	/>
</div>
