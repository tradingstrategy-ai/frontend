<!--
@component
Shared shell for vault scatter plots providing TVL filter controls,
loading/error states, and a Plotly chart container.

- Exposes `chartContainer` as a bindable prop for Plotly rendering
- Accepts a `belowChart` snippet for extra content below the chart

@example
```svelte
  <ScatterPlotShell bind:chartContainer {loading} {error} bind:minTvl>
    {#snippet belowChart()}
      <p>Extra content below chart</p>
    {/snippet}
  </ScatterPlotShell>
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tvlOptions } from './helpers';
	import Spinner from '$lib/components/Spinner.svelte';

	interface Props {
		chartContainer: HTMLDivElement;
		loading: boolean;
		error: string | null;
		minTvl: number;
		onMinTvlChange?: (value: number) => void;
		extraControls?: Snippet;
		belowChart?: Snippet;
	}

	let {
		chartContainer = $bindable(),
		loading,
		error,
		minTvl = $bindable(),
		onMinTvlChange,
		extraControls,
		belowChart
	}: Props = $props();

	function handleMinTvlChange(e: Event) {
		const value = Number((e.target as HTMLSelectElement).value);
		if (onMinTvlChange) {
			onMinTvlChange(value);
		} else {
			minTvl = value;
		}
	}
</script>

<div class="scatter-plot-wrapper" data-testid="vault-scatter-plot">
	<div class="controls">
		<label>
			Min TVL:
			<select value={minTvl} onchange={handleMinTvlChange}>
				{#each tvlOptions as { value, label } (value)}
					<option {value} selected={value === minTvl}>{label}</option>
				{/each}
			</select>
		</label>
		{@render extraControls?.()}
	</div>

	<div class="chart-surface">
		{#if loading}
			<div class="loading surface-overlay">
				<Spinner size="60" />
				<p>Loading chart...</p>
			</div>
		{/if}

		{#if error}
			<div class="error surface-overlay">
				<p>{error}</p>
			</div>
		{/if}

		<div bind:this={chartContainer} class="chart-container" class:obscured={loading || !!error}></div>
	</div>
	{@render belowChart?.()}
</div>

<style>
	.scatter-plot-wrapper {
		display: grid;
		gap: 1rem;
		width: 100%;
	}

	.controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding-bottom: 0.75rem;
		font: var(--f-ui-md-medium);
		color: var(--c-text-light);

		@media (--viewport-sm-down) {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		:global(select) {
			margin-left: 0.25rem;
			padding: 0.25rem 0.5rem;
			background: var(--c-background-accent-1);
			color: var(--c-text);
			border: 1px solid var(--c-border);
			border-radius: var(--radius-md);
			font: var(--f-ui-md-medium);
		}
	}

	.chart-surface {
		position: relative;
		isolation: isolate;
		min-height: 500px;
		padding: clamp(0.75rem, 1.8vw, 1.1rem);
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 18%);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 4%),
				color-mix(in srgb, var(--c-box-2), transparent 10%)
			),
			radial-gradient(circle at top left, color-mix(in srgb, var(--c-bullish), transparent 93%) 0%, transparent 38%),
			linear-gradient(135deg, color-mix(in srgb, var(--c-text-light), transparent 97%), transparent 48%),
			color-mix(in srgb, var(--c-box-1), transparent 12%);
		backdrop-filter: blur(0.8rem) saturate(1.08);
		box-shadow:
			0 1.25rem 2.5rem color-mix(in srgb, var(--c-text-inverted), transparent 84%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 72%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 94%);

		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			pointer-events: none;
			border-radius: inherit;
		}

		&::before {
			background: radial-gradient(
				circle at top,
				color-mix(in srgb, var(--c-text-light), transparent 88%) 0%,
				transparent 50%
			);
			opacity: 0.7;
		}

		&::after {
			background: linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-text-inverted), transparent 96%) 0%,
				transparent 28%,
				color-mix(in srgb, var(--c-text-inverted), transparent 94%) 100%
			);
			opacity: 0.9;
		}
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--c-text-light);
	}

	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--c-error);
	}

	.surface-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		padding: inherit;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--c-box-1), transparent 2%),
			color-mix(in srgb, var(--c-box-1), transparent 16%)
		);
	}

	.chart-container {
		width: 100%;
		min-height: 500px;
		position: relative;
		z-index: 0;

		:global(.js-plotly-plot),
		:global(.plot-container),
		:global(.svg-container) {
			border-radius: calc(var(--radius-lg) - 0.25rem);
		}

		:global(.modebar) {
			top: 0.35rem;
			right: 0.35rem;
			border-radius: calc(var(--radius-md) - 0.125rem);
			backdrop-filter: blur(0.65rem) saturate(1.08);
		}

		&.obscured {
			visibility: hidden;
		}
	}
</style>
