import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { type ChartRegistrations, chartRegistrationsSchema } from 'trade-executor/schemas/chart.js';

export async function load({ parent, url }) {
	const { admin, strategy } = await parent();
	if (!admin) error(401, 'Unauthorized');

	let chartRegistrations: ChartRegistrations;

	try {
		const resp = await fetch(`${strategy.url}/chart-registry`);
		if (!resp.ok) throw await publicApiError(resp);
		chartRegistrations = chartRegistrationsSchema.parse(await resp.json());
	} catch (e) {
		const stack = [`Error loading data from URL: ${strategy.url}/status`, e.message];
		error(503, { message: 'Service Unavailable', stack });
	}

	let chartId = url.searchParams.get('chart_id') ?? undefined;
	if (chartId && !chartRegistrations.find(({ id }) => id === chartId)) {
		chartId = undefined;
	}

	return {
		chartRegistrations,
		chartId
	};
}
