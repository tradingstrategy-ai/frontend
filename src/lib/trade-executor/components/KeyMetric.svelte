<!--
@component
Display one key metric in a strategy tile.
- Key metric can come from backtest or live data
- Key metric may contain a help link (based on strategyId)

#### Usage:
```tsx
	<KeyMetric
		name="Total assets"
		metric={metrics.total_equity}
		formatter={formatDollar}
		backtestLink={`/strategies/${strategyId}/backtest`}
	/>
```
-->
<script lang="ts">
	import type { KeyMetric } from 'trade-executor/statistics/key-metric';
	import { Tooltip } from '$lib/components';
	import IconQuestionCircle from '~icons/local/question-circle';
	import KeyMetricDescription from './KeyMetricDescription.svelte';

	// Displayed metric name as the box label
	export let name: string;
	// Displayed as the metric name in the tooltip
	export let tooltipName: string | undefined = undefined;
	// Extra one liner about the metric description for the tooltip
	export let tooltipExtraDescription: string | undefined = undefined;
	// Source from the trade-executir API
	export let metric: KeyMetric | undefined = undefined;
	// How to we format the number
	export let formatter: Formatter<any> | undefined = undefined;
	// Used link to strategy's backtest page
	export let backtestLink: string | undefined = undefined;

	$: value = metric?.value;
	$: formattedValue = formatter ? formatter(value) : value;
</script>

<div class="key-metric" data-css-props>
	{#if metric || tooltipExtraDescription}
		<Tooltip>
			<div slot="trigger" class="label">
				{name}
				<IconQuestionCircle />
			</div>
			<KeyMetricDescription
				slot="popup"
				title={tooltipName ?? name}
				extraDescription={tooltipExtraDescription}
				{metric}
				{backtestLink}
			/>
		</Tooltip>
	{:else}
		<div class="label">{name}</div>
	{/if}
	<div class="value" data-testid="key-metric-{metric?.kind}-value">
		<slot {value}>{formattedValue}</slot>
	</div>
	{#if metric?.source === 'backtesting'}
		<Tooltip>
			<div slot="trigger" class="backtest-indicator">
				Estimate
				<IconQuestionCircle />
			</div>
			<div class="backtest-tooltip" slot="popup">
				<h3>Backtesting estimate</h3>
				<p>
					This strategy has not been trading long enough to reliably calculate
					<a target="_blank" href={metric.help_link}>{tooltipName ?? name}</a>
					based on the live trading data. Instead, a
					<a href={backtestLink}>backtested</a>
					estimation is displayed.
				</p>
				<p>
					<a href={backtestLink}>View the backtest results for this strategy</a>.
				</p>
			</div>
		</Tooltip>
	{/if}
</div>

<style lang="postcss">
	[data-css-props] {
		--key-metric-gap: 0.375rem;
		--key-metric-label-font: var(--f-ui-sm-medium);
		--key-metric-label-letter-spacing: var(--ls-ui-sm);
		--key-metric-value-font: var(--f-ui-lg-medium);
		--key-metric-value-letter-spacing: var(--ls-ui-lg);
		--backtest-indicator-font: var(--f-ui-xxs-bold);

		@media (--viewport-sm-down) {
			--key-metric-gap: 0.25rem;
			--key-metric-label-font: var(--f-ui-xs-medium);
			--key-metric-label-letter-spacing: var(--ls-ui-xs);
			--key-metric-value-font: var(--f-ui-md-medium);
			--key-metric-value-letter-spacing: var(--ls-ui-md);
			--backtest-indicator-font: var(--f-ui-xxxs-bold);
		}
	}

	.key-metric {
		display: grid;
		gap: var(--key-metric-gap);
		align-content: flex-start;
		white-space: nowrap;

		:global(.icon) {
			transform: translateY(-0.1em);
		}

		.label {
			font: var(--key-metric-label-font);
			letter-spacing: var(--key-metric-label-letter-spacing, normal);
			color: var(--c-text-light);
		}

		.value {
			font: var(--key-metric-value-font);
			letter-spacing: var(--key-metric-value-letter-spacing);
		}

		.backtest-indicator {
			font: var(--backtest-indicator-font);
			letter-spacing: 0.03em;
			text-transform: uppercase;
			color: color-mix(in srgb, var(--c-text-extra-light), var(--c-warning) 40%);

			--icon-size: 1.1em;
			:global(svg path) {
				stroke-width: 2.5;
			}
		}

		.backtest-tooltip {
			max-width: 50ch;
			h3 {
				font: var(--f-ui-xl-medium);
				letter-spacing: var(--ls-ui-xl);
				margin-bottom: 0.75rem !important;
			}
		}
	}
</style>
