<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SimpleDataItem, TimeSpan } from './types';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import { TimeSpans } from '$lib/charts/time-span';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { type ProfitInfo, getProfitInfo } from '$lib/components/Profitability.svelte';
	import { dateToTs, getVisibleRange, normalizeDataForInterval } from './helpers';
	import { relativeProfitability } from '$lib/helpers/profit';

	type Props = {
		data: [number, number][] | undefined;
		title?: Snippet<[TimeSpan, Maybe<ProfitInfo>]> | string;
		subtitle?: Snippet;
		children: Snippet<[TimeSpan, Maybe<ProfitInfo>, SimpleDataItem[], Maybe<[Date, Date]>, Maybe<SimpleDataItem>]>;
	};

	let { data, title, subtitle, children }: Props = $props();

	const timeSpans = new OptionGroup(TimeSpans.keys, '3M');

	let timeSpan = $derived(TimeSpans.get(timeSpans.selected));

	let normalizedData = $derived(normalizeDataForInterval(data ?? [], timeSpan.interval));

	let visibleRange = $derived(getVisibleRange(normalizedData, timeSpan));

	let firstVisibleDataItem = $derived.by(() => {
		if (!visibleRange) return;
		const startTs = dateToTs(visibleRange[0]);
		return normalizedData.findLast(({ time }) => time === startTs) ?? normalizedData[0];
	});

	let periodPerformance = $derived.by(() => {
		if (!visibleRange || !firstVisibleDataItem) return;
		const startTs = dateToTs(visibleRange[0]);
		const startValue = startTs > normalizedData[0].time ? firstVisibleDataItem.value : 0;
		const endValue = normalizedData.at(-1)?.value;
		return getProfitInfo(relativeProfitability(startValue, endValue));
	});
</script>

<div class="chart-container" data-css-props>
	<header>
		{#if typeof title === 'string'}
			<h2>{title}</h2>
		{:else}
			<div>{@render title?.(timeSpan, periodPerformance)}</div>
		{/if}
		<SegmentedControl secondary options={timeSpans.options} bind:selected={timeSpans.selected} />
		<p>{@render subtitle?.()}</p>
	</header>

	{@render children(timeSpan, periodPerformance, normalizedData, visibleRange, firstVisibleDataItem)}
</div>

<style>
	[data-css-props] {
		--chart-container-padding: 1.5rem;

		@media (--viewport-md-down) {
			--chart-container-padding: 1rem;
		}
	}

	.chart-container {
		:global([data-css-props]) {
			@media (--viewport-xs) {
				--segmented-control-font: var(--f-ui-xs-medium);
				--segmented-control-letter-spacing: var(--ls-ui-xs);
			}
		}

		display: grid;
		gap: var(--space-sm);
		background: var(--c-box-1);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		padding-block: var(--chart-container-padding);

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: var(--space-sm);
			padding-inline: var(--chart-container-padding);

			h2 {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}

			p {
				grid-column: 1 / -1;
				font: var(--f-ui-md-roman);
				letter-spacing: var(ls-ui-md);

				@media (--viewport-xs) {
					font: var(--f-ui-sm-roman);
					letter-spacing: var(ls-ui-sm);
				}
			}
		}
	}
</style>
