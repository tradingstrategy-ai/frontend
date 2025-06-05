import { error } from '@sveltejs/kit';
import { fetchPublicApi } from '$lib/helpers/public-api.js';
import { apiCandleToDataItem } from '$lib/charts/candle-data-feed.svelte.js';
import { timeBucketToInterval } from '$lib/charts/helpers.js';

export async function load({ fetch, params, parent }) {
	if (params.status !== 'closed') error(404);

	const { position } = await parent();
	if (position.isCreditPosition) error(404);

	const { pair } = position;
	const pairId = String(pair.internal_id);
	const exchangeType = pair.exchange_name === 'uniswap-v3' ? 'uniswap_v3' : 'uniswap_v2';

	const durationDays = position.durationSeconds / (60 * 60 * 24);
	const timeBucket = durationDays > 6 ? '1d' : '4h';
	const interval = timeBucketToInterval(timeBucket);

	const start = interval.offset(interval.floor(position.opened_at), -2);
	const end = interval.ceil(position.closed_at!);
	const range: [Date, Date] = [start, interval.offset(end, 1)];

	const rawCandleData = await fetchPublicApi(fetch, 'candles', {
		pair_id: pairId,
		exchange_type: exchangeType,
		candle_type: 'price',
		time_bucket: timeBucket,
		start: start.toISOString().slice(0, 19),
		end: end.toISOString().slice(0, 19)
	});

	return {
		timeBucket,
		candleData: rawCandleData[pairId].map(apiCandleToDataItem),
		interval,
		range,
		// remove unneeded layout items (page used only for generating social media image)
		skipNavbar: true,
		skipBreadcrumbs: true,
		skipFooter: true
	};
}
