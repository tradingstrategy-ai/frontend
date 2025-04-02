import type { AutoscaleInfo, DataItem, UTCTimestamp } from 'lightweight-charts';

export type SeriesDataItem = DataItem<UTCTimestamp>;

export type PriceScaleCalculator = (data: SeriesDataItem[]) => AutoscaleInfo | null;
