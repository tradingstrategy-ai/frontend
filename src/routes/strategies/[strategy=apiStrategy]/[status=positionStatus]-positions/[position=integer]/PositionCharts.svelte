<!--
@component
Lazy-loaded position charts section for API strategy position detail pages.
Fetches `/position-chart/{position-id}` client-side and renders the ECharts
implementation only after the page has mounted.

@example

```svelte
	<PositionCharts executorUrl={strategy.url} positionId={position.position_id} />
```
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getPositionChart } from 'trade-executor/client/position-chart';
	import type { PositionChart } from 'trade-executor/schemas/position-chart';

	type Props = {
		executorUrl: string;
		positionId: number;
		tradePathBase: string;
	};

	let { executorUrl, positionId, tradePathBase }: Props = $props();

	let ChartComponent = $state<typeof import('./PositionChartsECharts.svelte').default>();
	let chartData = $state<PositionChart | null>(null);
	let loadError = $state<string | null>(null);

	onMount(() => {
		const abortController = new AbortController();

		async function loadCharts() {
			try {
				const [module, payload] = await Promise.all([
					import('./PositionChartsECharts.svelte'),
					getPositionChart(fetch, executorUrl, positionId, { signal: abortController.signal })
				]);

				if (abortController.signal.aborted) return;
				ChartComponent = module.default;
				chartData = payload;
			} catch (error) {
				if (abortController.signal.aborted) return;
				console.error('Failed to load position charts:', error);
				loadError = 'Position charts failed to load.';
			}
		}

		void loadCharts();

		return () => abortController.abort();
	});
</script>

<div class="position-charts" data-testid="position-charts">
	{#if ChartComponent && chartData}
		<ChartComponent data={chartData} {tradePathBase} />
	{:else if loadError}
		<div class="chart-feedback error">{loadError}</div>
	{:else}
		<div class="skeleton-grid" aria-hidden="true">
			<div class="skeleton-card">
				<div class="skeleton-title"></div>
				<div class="skeleton-chart"></div>
			</div>
			<div class="skeleton-card">
				<div class="skeleton-title"></div>
				<div class="skeleton-chart"></div>
			</div>
		</div>
	{/if}
</div>

<style>
	.position-charts {
		display: grid;
		gap: 1rem;
	}

	.skeleton-grid {
		display: grid;
		gap: 1rem;
	}

	.skeleton-card,
	.chart-feedback {
		background: var(--c-box-1);
		border-radius: var(--radius-md);
		padding: var(--space-lg);

		@media (--viewport-md-down) {
			padding: var(--space-md);
		}
	}

	.skeleton-card {
		display: grid;
		gap: 1rem;
	}

	.skeleton-title,
	.skeleton-chart {
		background: var(--c-box-3);
		animation: pulse-opacity 1s infinite ease-out;
	}

	.skeleton-title {
		width: 12rem;
		max-width: 60%;
		height: 1.25rem;
		border-radius: var(--radius-xxs);
	}

	.skeleton-chart {
		height: 20rem;
		border-radius: var(--radius-sm);

		@media (--viewport-sm-down) {
			height: 16rem;
		}
	}

	.chart-feedback {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 14rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
		letter-spacing: var(--ls-ui-md);
		text-align: center;
	}

	.chart-feedback.error {
		border: 1px solid color-mix(in srgb, var(--c-danger) 40%, transparent);
	}
</style>
