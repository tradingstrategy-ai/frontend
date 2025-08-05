async function fetchAnalysis(fetch: Fetch, strategyUrl: string, chartId: string) {
	const response = await fetch(`${strategyUrl}/chart-registry/render?chart_id=${chartId}`);
	const blob = await response.blob();
	return URL.createObjectURL(blob);
}

export async function load({ fetch, parent, url }) {
	const { strategy, chartRegistrations } = await parent();

	let chartId = url.searchParams.get('chart_id') ?? undefined;
	if (chartId && !chartRegistrations.find(({ id }) => id === chartId)) {
		chartId = undefined;
	}

	const content = chartId ? fetchAnalysis(fetch, strategy.url, chartId) : undefined;

	return { chartRegistrations, chartId, content };
}
