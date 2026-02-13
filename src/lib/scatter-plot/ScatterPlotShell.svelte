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
		extraControls?: Snippet;
		belowChart?: Snippet;
	}

	let {
		chartContainer = $bindable(),
		loading,
		error,
		minTvl = $bindable(),
		extraControls,
		belowChart
	}: Props = $props();
</script>

<div class="scatter-plot-wrapper" data-testid="vault-scatter-plot">
	<div class="controls">
		<label>
			Min TVL:
			<select bind:value={minTvl}>
				{#each tvlOptions as { value, label } (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</label>
		{@render extraControls?.()}
	</div>

	{#if loading}
		<div class="loading">
			<Spinner size="60" />
			<p>Loading chart...</p>
		</div>
	{/if}

	{#if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{/if}

	<div bind:this={chartContainer} class="chart-container" class:obscured={loading || !!error}></div>
	{@render belowChart?.()}
</div>

<style>
	.scatter-plot-wrapper {
		position: relative;
		width: 100%;
		min-height: 500px;
	}

	.controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding-bottom: 0.75rem;
		font: var(--f-ui-md-medium);
		color: var(--c-text-light);

		select {
			margin-left: 0.25rem;
			padding: 0.25rem 0.5rem;
			background: var(--c-background-accent-1);
			color: var(--c-text);
			border: 1px solid var(--c-border);
			border-radius: var(--radius-md);
			font: var(--f-ui-md-medium);
		}
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 500px;
		color: var(--c-text-light);
	}

	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 500px;
		color: var(--c-error);
	}

	.chart-container {
		width: 100%;
		min-height: 500px;

		&.obscured {
			visibility: hidden;
			position: absolute;
			inset: 0;
		}
	}
</style>
