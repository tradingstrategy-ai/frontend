import { error } from '@sveltejs/kit';
import { getStrategyState } from 'trade-executor/state';

export async function GET({ fetch, params }) {
	const state = await getStrategyState(fetch, params.strategy, true);
	const position = state?.portfolio[`${params.status}_positions`][params.position];
	const trade = position?.trades[params.trade];

	if (!trade) throw error(404, 'Not found');

	const payload = JSON.stringify(trade, null, 4);

	return new Response(payload, {
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': String(Buffer.byteLength(payload))
		}
	});
}
