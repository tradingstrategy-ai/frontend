<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { AreaSeriesPartialOptions, AreaData, UTCTimestamp } from 'lightweight-charts';
	import type { SimpleDataItem } from './types';
	import { getProfitInfo, type ProfitInfo } from '$lib/components/Profitability.svelte';
	import { AreaSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { merge } from '$lib/helpers/object';
	import { relativeReturn } from '$lib/helpers/financial';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data' | 'dataFeed' | 'options' | 'onVisibleDataChange'>;

	type Props = Partial<SupportedSeriesProps> & {
		data: AreaData<UTCTimestamp>[];
		direction?: ProfitInfo['direction'];
		options?: AreaSeriesPartialOptions;
		onVisibleDataChange?: (data: SimpleDataItem[], profitInfo: ProfitInfo) => void;
	};

	let { data, direction: directionOverride, options, onVisibleDataChange, ...restProps }: Props = $props();

	let visibleDataDirection = $state<number>();

	let directionOptions = $derived.by(() => {
		const direction = directionOverride ?? visibleDataDirection ?? 0;
		if (direction < 0) {
			return { lineColor: colors.bearish, topColor: colors.bearish30, bottomColor: colors.bearish0 };
		} else if (direction > 0) {
			return { lineColor: colors.bullish, topColor: colors.bullish30, bottomColor: colors.bullish0 };
		} else {
			return { lineColor: colors.neutral, topColor: colors.neutral30, bottomColor: colors.neutral0 };
		}
	});

	function onVisibleDataChangeWrapper(data: SimpleDataItem[]) {
		const profitInfo = getProfitInfo(relativeReturn(data[0]?.value, data.at(-1)?.value));
		visibleDataDirection = profitInfo.direction;
		onVisibleDataChange?.(data, profitInfo);
	}
</script>

<Series
	type={AreaSeries}
	{data}
	options={merge({ ...directionOptions }, options)}
	onVisibleDataChange={(data) => onVisibleDataChangeWrapper(data as SimpleDataItem[])}
	{...restProps}
/>
