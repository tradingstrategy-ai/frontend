import type { z } from 'zod';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { chartRegistrationsSchema, chartPairsSchema } from 'trade-executor/schemas/chart.js';

async function fetchChartEndpoint<T extends z.ZodTypeAny>(fetch: Fetch, url: string, schema: T): Promise<z.infer<T>> {
	try {
		const resp = await fetch(url);
		if (!resp.ok) throw await publicApiError(resp);
		return schema.parse(await resp.json());
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		error(503, { message: 'Service Unavailable', stack });
	}
}

export async function load({ fetch, parent }) {
	const { admin, strategy } = await parent();

	if (!admin) error(401, 'Unauthorized');

	const chartRegistrationsPromise = fetchChartEndpoint(
		fetch,
		`${strategy.url}/chart-registry`,
		chartRegistrationsSchema
	);

	const chartPairsPromise = fetchChartEndpoint(fetch, `${strategy.url}/chart-registry/pairs`, chartPairsSchema);

	return {
		chartRegistrations: await chartRegistrationsPromise,
		chartPairs: await chartPairsPromise
	};
}
