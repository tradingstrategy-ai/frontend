<!--
@component
Wrapper for the reusable historical TVL chart configured for vault protocol groupings.

@example

```svelte
	<HistoricalTvlProtocolChart data={chartData} dataLoading={loading} error={error} />
```
-->
<script lang="ts">
	import HistoricalTvlGroupChart from '$lib/echarts/HistoricalTvlGroupChart.svelte';
	import type { HistoricalTvlByProtocolPayload, HistoricalTvlByProtocolSeries } from '$lib/echarts/historical-tvl';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';

	interface Props {
		data: HistoricalTvlByProtocolPayload | null;
		dataLoading?: boolean;
		error?: string | null;
	}

	let { data, dataLoading = false, error = null }: Props = $props();

	function getSeriesLogoUrl(series: HistoricalTvlByProtocolSeries) {
		return getVaultProtocolLogoUrl(series.protocolSlug);
	}
</script>

<div class="standalone-historical-tvl-protocol-shell">
	<HistoricalTvlGroupChart
		{data}
		{dataLoading}
		{error}
		searchParamKey="protocols"
		selectorLabel="Protocol"
		selectorLabelPlural="protocols"
		watermarkCorner="top-left"
		{getSeriesLogoUrl}
	/>
</div>
