import type { Candle } from '$lib/chart/helpers';
import type { CandlestickData } from 'lightweight-charts';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { error } from '@sveltejs/kit';
import { floorUTCDate, addUTCDays } from '$lib/helpers/date.js';
import { fetchCandles } from '$lib/charts/client.js';

export async function load({ fetch, params, parent }) {
	// page only available to admins
	if (!(await parent()).admin) error(404, 'Not found');

	const { summary } = await fetchPublicApi(fetch, 'pair-details', {
		chain_slug: params.chain,
		exchange_slug: params.exchange,
		pair_slug: params.pair
	});

	const candleParams = {
		pair_id: summary.pair_id,
		exchange_type: summary.exchange_type
	};

	const candles = await fetchCandles(null, 360, candleParams);

	return { summary, candles, candleParams };
}
