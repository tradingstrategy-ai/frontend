<script lang="ts">
	import type { AreaData, UTCTimestamp } from 'lightweight-charts';
	import { inview } from 'svelte-inview';

	interface Props {
		data: AreaData<UTCTimestamp>[];
		dateRange: [Date, Date];
		directionMode?: 'absolute' | 'relative';
	}

	let { data, dateRange, directionMode = 'absolute' }: Props = $props();

	let ChartComponent = $state<typeof import('./ChartThumbnail.svelte').default>();
	let loadError = $state(false);

	async function onEnter() {
		if (ChartComponent || loadError) return;

		try {
			const module = await import('./ChartThumbnail.svelte');
			ChartComponent = module.default;
		} catch (error) {
			console.error('Failed to load strategy tile chart:', error);
			loadError = true;
		}
	}
</script>

<div class="lazy-chart-thumbnail" use:inview={{ rootMargin: '300px' }} oninview_enter={onEnter}>
	{#if ChartComponent}
		<ChartComponent {data} {dateRange} {directionMode} />
	{:else if loadError}
		<div class="chart-fallback">Chart unavailable</div>
	{:else}
		<div class="chart-skeleton" aria-hidden="true"></div>
	{/if}
</div>

<style>
	.lazy-chart-thumbnail {
		min-height: 14rem;

		@media (--viewport-xs) {
			min-height: 11rem;
		}
	}

	.chart-skeleton,
	.chart-fallback {
		height: 100%;
		min-height: inherit;
		background: var(--c-box-3);
	}

	.chart-skeleton {
		animation: pulse-opacity 1s infinite ease-out;
	}

	.chart-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		text-align: center;
	}
</style>
