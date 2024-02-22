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

	export let name: string;
	export let metric: KeyMetric | undefined = undefined;
	export let formatter: Formatter<any> | undefined = undefined;
	export let strategyId: string | undefined = undefined;

	$: value = metric?.value;
	$: formattedValue = formatter ? formatter(value) : value;
</script>

<div class="key-metric" data-css-props>
	{#if metric && strategyId}
		<Tooltip>
			<dt slot="trigger" class={metric?.source}>
				<span>{name}</span>
				<Icon name="question-circle" />
			</dt>
			<KeyMetricDescription slot="popup" title={name} {metric} {strategyId} />
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
			display: flex;
			gap: 0.75ex;
			align-items: center;
			font: var(--key-metric-label-font);
			letter-spacing: var(--key-metric-label-letter-spacing, normal);
			color: var(--c-text-light);

			&.backtesting > span::after {
				content: '*';
			}
		}

		dd {
			font: var(--key-metric-value-font);
			letter-spacing: var(--key-metric-value-letter-spacing);
		}
	}
</style>
