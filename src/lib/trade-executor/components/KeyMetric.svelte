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
		strategyId={strategy.id}
	/>
```
-->
<script lang="ts">
	import type { KeyMetric } from 'trade-executor/statistics/key-metric';
	import { Icon, Tooltip } from '$lib/components';
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
	// Needed to generate strategy backtest link
	export let strategyId: string | undefined = undefined;

	$: value = metric?.value;
	$: formattedValue = formatter ? formatter(value) : value;
</script>

<div class="key-metric" data-css-props>
	{#if metric && strategyId}
		<Tooltip>
			<dt slot="trigger" class={metric?.source}>
				<!-- get words to wrap, while keeping icon with last word (see CSS below) -->
				<span>{@html name.replaceAll(/ +/g, ' <wbr/>')}</span>
				<Icon name="question-circle" />
			</dt>
			<KeyMetricDescription
				slot="popup"
				title={tooltipName ?? name}
				extraDescription={tooltipExtraDescription}
				{metric}
				{strategyId}
			/>
		</Tooltip>
	{:else}
		<dt>{name}</dt>
	{/if}
	<dd data-testid="key-metric-{metric?.kind}-value">
		<slot {value}>{formattedValue}</slot>
	</dd>
</div>

<style lang="postcss">
	[data-css-props] {
		--key-metric-gap: 0.375rem;
		--key-metric-label-font: var(--f-ui-sm-medium);
		--key-metric-label-letter-spacing: var(--ls-ui-sm);
		--key-metric-value-font: var(--f-ui-lg-medium);
		--key-metric-value-letter-spacing: var(--ls-ui-lg);

		@media (--viewport-sm-down) {
			--key-metric-gap: 0.25rem;
			--key-metric-label-font: var(--f-ui-xs-medium);
			--key-metric-label-letter-spacing: var(--ls-ui-xs);
			--key-metric-value-font: var(--f-ui-md-medium);
			--key-metric-value-letter-spacing: var(--ls-ui-md);
		}
	}

	.key-metric {
		display: grid;
		gap: var(--key-metric-gap);

		dt {
			font: var(--key-metric-label-font);
			white-space: nowrap;
			letter-spacing: var(--key-metric-label-letter-spacing, normal);
			color: var(--c-text-light);

			&.backtesting > span::after {
				content: '*';
				font-weight: bold;
				font-size: 1.2em;
			}

			--icon-size: 1.1em;
			:global(svg) {
				transform: translateY(-0.1em);
			}
		}

		dd {
			font: var(--key-metric-value-font);
			letter-spacing: var(--key-metric-value-letter-spacing);
		}
	}
</style>
