import type { AutoscaleInfo, CandlestickData, DataItem, UTCTimestamp } from 'lightweight-charts';

export type TvDataItem = DataItem<UTCTimestamp>;

export type CandleDataItem = CandlestickData<UTCTimestamp>;

declare const foo: TvDataItem;

export type PriceScaleCalculator = (data: TvDataItem[]) => AutoscaleInfo | null;

export type DataFeed<T extends TvDataItem = TvDataItem> = {
	loading: boolean;
	loadingInitialData: boolean;
	hasData: boolean;
	hasMoreData: boolean;
	data: T[];
	fetchData: (ticks?: number) => void;
};
