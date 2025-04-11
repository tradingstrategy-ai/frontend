<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { AreaSeriesPartialOptions, AreaData, UTCTimestamp } from 'lightweight-charts';
	import type { ProfitInfo } from '$lib/components/Profitability.svelte';
	import { AreaSeries } from 'lightweight-charts';
	import Series from '$lib/charts/Series.svelte';
	import { getChartContext } from './TvChart.svelte';
	import { merge } from '$lib/helpers/object';

	const { colors } = getChartContext();

	type SeriesProps = ComponentProps<typeof Series>;
	type SupportedSeriesProps = Omit<SeriesProps, 'type' | 'data' | 'dataFeed' | 'options'>;

	type Props = Partial<SupportedSeriesProps> & {
		data: AreaData<UTCTimestamp>[];
		direction?: ProfitInfo['direction'];
		options?: AreaSeriesPartialOptions;
	};

	let { data, direction = 0, options, ...restProps }: Props = $props();

	const directionOptions = [
		{ lineColor: colors.bearish, topColor: colors.bearish30, bottomColor: colors.bearish0 },
		{ lineColor: colors.textUltraLight, topColor: 'transparent', bottomColor: 'transparent' },
		{ lineColor: colors.bullish, topColor: colors.bullish30, bottomColor: colors.bullish0 }
	] as const;

	let mergedOptions = $derived(merge({ ...directionOptions[direction + 1] }, options));
</script>

<Series type={AreaSeries} {data} options={mergedOptions} {...restProps} />
