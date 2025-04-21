<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import TvChart from './TvChart.svelte';
	import BaselineSeries from './BaselineSeries.svelte';
	import type { TimeSpan } from './types';

	type Props = ComponentProps<typeof TvChart> & {
		timeSpan: TimeSpan;
		visibleRange: Maybe<[Date, Date]>;
	};

	let { timeSpan, visibleRange, children, ...restProps }: Props = $props();
</script>

<TvChart {...restProps}>
	{@render children?.()}

	{#if visibleRange}
		<BaselineSeries interval={timeSpan.interval} range={visibleRange} setChartVisibleRange />
	{/if}
</TvChart>
