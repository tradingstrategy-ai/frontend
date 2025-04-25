import type { TimeInterval } from 'd3-time';
import type {
	AutoscaleInfo,
	CandlestickData,
	DataItem,
	DeepPartial,
	IChartApi,
	ISeriesApi,
	SeriesType,
	SingleValueData,
	TimeChartOptions,
	UTCTimestamp
} from 'lightweight-charts';
import type { TimeBucket } from '$lib/schemas/utility';
import type { ChartColors } from './TvChart.svelte';

export type TvChartOptions = DeepPartial<TimeChartOptions>;

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

export type TimeSpan = {
	performanceLabel: string;
	timeBucket: TimeBucket;
	spanDays?: number;
	interval: TimeInterval;
};

export type SimpleDataItem = SingleValueData<UTCTimestamp>;

export type PriceScaleCalculator = (data: TvDataItem[]) => AutoscaleInfo | null;

export type DataFeed<T extends TvDataItem = TvDataItem> = {
	loading: boolean;
	loadingInitialData: boolean;
	hasData: boolean;
	hasMoreData: boolean;
	data: T[];
	fetchData: (ticks?: number) => void;
};

export type ChartCallbackReturnType = (() => void) | void;

export type ChartCallbackParam = { chart: IChartApi; colors: ChartColors };
export type ChartCallback = ({ chart }: ChartCallbackParam) => ChartCallbackReturnType;

export type SeriesCallbackParam = ChartCallbackParam & { series: ISeriesApi<SeriesType> };
export type SeriesCallback = ({ chart, series }: SeriesCallbackParam) => ChartCallbackReturnType;
