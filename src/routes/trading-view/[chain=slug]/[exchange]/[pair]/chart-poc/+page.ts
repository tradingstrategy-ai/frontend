import type { Candle } from '$lib/chart/helpers';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { error } from '@sveltejs/kit';
import { floorUTCDate, addUTCDays } from '$lib/helpers/date.js';

export async function load({ fetch, params, parent }) {
	// page only available to admins
	if (!(await parent()).admin) error(404, 'Not found');

	const { summary } = await fetchPublicApi(fetch, 'pair-details', {
		chain_slug: params.chain,
		exchange_slug: params.exchange,
		pair_slug: params.pair
	});

	const end = floorUTCDate(new Date());
	const start = addUTCDays(end, -180);

	// fetch last 180 daily candles
	const candleData = await fetchPublicApi(fetch, 'candles', {
		pair_id: summary.pair_id,
		exchange_type: summary.exchange_type,
		candle_type: 'price',
		time_bucket: '1d',
		start: start.toISOString().slice(0, 10),
		end: end.toISOString().slice(0, 10)
	});

	const candles = candleData[summary.pair_id] as Candle[];

	return { summary, candles };
}
