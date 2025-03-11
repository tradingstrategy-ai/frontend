import type { Candle } from '$lib/chart/helpers';
import type { CandlestickData } from 'lightweight-charts';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { type MaybeParsableDate, parseDate } from '$lib/helpers/date.js';
import { floorUTCDate, addUTCDays } from '$lib/helpers/date.js';

export type CandleParams = {
	pair_id: string;
	exchange_type: string;
};

export async function fetchCandles(lastDateVal: MaybeParsableDate, numCandles: number, params: CandleParams) {
	let lastDate = parseDate(lastDateVal);
	let end: Date;

	if (lastDate) {
		end = addUTCDays(floorUTCDate(lastDate), -1);
	} else {
		end = floorUTCDate(new Date());
	}

	const start = addUTCDays(end, -numCandles);

	const candleData = await fetchPublicApi(fetch, 'candles', {
		...params,
		candle_type: 'price',
		time_bucket: '1d',
		start: start.toISOString().slice(0, 10),
		end: end.toISOString().slice(0, 10)
	});

	const candles = candleData[params.pair_id].map(({ o, h, l, c, v, ts }: Candle) => {
		return {
			open: o,
			high: h,
			low: l,
			close: c,
			customValues: {
				volume: v
			},
			time: new Date(`${ts}Z`).valueOf() / 1000
		};
	}) as CandlestickData[];

	return candles;
}

export function getVolumeData(candles: CandlestickData[], colors: { bullish: string; bearish: string }) {
	return candles.map((c) => {
		return {
			time: c.time,
			value: c.customValues?.volume,
			color: c.close > c.open ? colors.bullish : colors.bearish
		};
	});
}
