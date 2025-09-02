import type { ChartRegistration } from 'trade-executor/schemas/chart.js';

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

async function fetchAnalysisContent(
	fetch: Fetch,
	strategyUrl: string,
	chartRegistration: ChartRegistration,
	pairIds: number[]
): Promise<AnalysisContent> {
	const params = new URLSearchParams({
		chart_id: chartRegistration.id,
		pair_ids: pairIds.join(',')
	});

	const response = await fetch(`${strategyUrl}/chart-registry/render?${params}`);
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
	const { strategy, chartRegistrations, tradingPairs } = await parent();

	const chartId = url.searchParams.get('chart_id') ?? undefined;
	const selectedChart = chartRegistrations.find(({ id }) => id === chartId);

	const pairIds = url.searchParams.get('pair_ids')?.split(',') ?? [];

	let selectedPairs = tradingPairs.all_pairs.filter((p) => {
		return pairIds.find((id) => Number(id) === p.internal_id);
	});

	if (!selectedPairs.length) selectedPairs = tradingPairs.default_pairs;

	const selectedPairIds = selectedPairs.map((p) => p.internal_id!);

	const contentPromise = selectedChart && fetchAnalysisContent(fetch, strategy.url, selectedChart, selectedPairIds);

	return { selectedChart, selectedPairIds, contentPromise };
}
