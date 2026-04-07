import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { positionChartSchema } from '../schemas/position-chart';

export async function getPositionChart(fetch: Fetch, executorUrl: string, positionId: number, init: RequestInit = {}) {
	const url = `${executorUrl}/position-chart/${positionId}`;
	let resp: Response;

	try {
		resp = await fetch(url, init);
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}`, (e as Error).message];
		error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return positionChartSchema.parse(await resp.json());
}
