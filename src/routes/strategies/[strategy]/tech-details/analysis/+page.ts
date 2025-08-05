// Use discriminated union so data type is correctly inferred
type AnalysisContent =
	| {
			type: 'image/png';
			data: Blob;
	  }
	| {
			type: 'text/html';
			data: string;
	  };

async function fetchAnalysisContent(fetch: Fetch, strategyUrl: string, chartId: string): Promise<AnalysisContent> {
	const response = await fetch(`${strategyUrl}/chart-registry/render?chart_id=${chartId}`);
	const type = response.headers.get('content-type') ?? 'unknown';

	if (type.startsWith('image/png')) {
		return {
			type: 'image/png',
			data: await response.blob()
		};
	}

	if (type.startsWith('text/html')) {
		return {
			type: 'text/html',
			data: await response.text()
		};
	}

	throw new Error(await response.text());
}

export async function load({ fetch, parent, url }) {
	const { strategy, chartRegistrations } = await parent();

	let chartId = url.searchParams.get('chart_id') ?? undefined;
	if (chartId && !chartRegistrations.find(({ id }) => id === chartId)) {
		chartId = undefined;
	}

	const contentPromise = chartId ? fetchAnalysisContent(fetch, strategy.url, chartId) : undefined;

	return { chartRegistrations, chartId, contentPromise };
}
