import type { AutoscaleInfo, CandlestickData, DataItem, UTCTimestamp } from 'lightweight-charts';

export type CandleTimeBucket = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '7d' | '30d';

export type ApiCandle = {
	ts: string;
	o: number;
	h: number;
	l: number;
	c: number;
	v?: number;
};

export type TvDataItem = DataItem<UTCTimestamp>;

export type CandleDataItem = CandlestickData<UTCTimestamp>;

export type PriceScaleCalculator = (data: TvDataItem[]) => AutoscaleInfo | null;

export type DataFeed<T extends TvDataItem = TvDataItem> = {
	loading: boolean;
	loadingInitialData: boolean;
	hasData: boolean;
	hasMoreData: boolean;
	data: T[];
	fetchData: (ticks?: number) => void;
};
