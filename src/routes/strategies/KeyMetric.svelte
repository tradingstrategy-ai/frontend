<!--
@component
Display one key metric in a strategy tile.
- Key metric can come from backtest or live data
- Key metric may contain a help link
- Optionally use named slots for custom formatting

#### Usage:
```tsx
	<KeyMetric
		name="Total assets"
		metric={metrics.total_equity}
		formatter={formatDollar}
		{backtestLink}
		{badgeSize}
	/>
```
-->
<script lang="ts">
	import type { KeyMetric } from 'trade-executor/strategy/runtime-state';
	import { DataBadge, Icon, Tooltip } from '$lib/components';
	import KeyMetricDescription from './KeyMetricDescription.svelte';

	export let name: string;
	export let metric: KeyMetric | undefined = undefined;
	export let formatter: Formatter<any> | undefined = undefined;
	export let backtestLink: string;
	export let badgeSize: 'sm' | 'md';

	$: value = metric?.value;
	$: formattedValue = formatter ? formatter(value) : value;
</script>

<Tooltip>
	<svelte:fragment slot="trigger">
		<dt>
			<span>{name}</span>
			<Icon name="question-circle" />
		</dt>
		<dd data-testid="key-metric-{metric?.kind}-value">
			<slot name="value" {value}>
				<DataBadge size={badgeSize}>
					{formattedValue}
				</DataBadge>
			</slot>
		</dd>
	</svelte:fragment>
	<svelte:fragment slot="popup">
		<slot name="tooltip-popup">
			<KeyMetricDescription title={name} {metric} {backtestLink} />
		</slot>
	</svelte:fragment>
</Tooltip>

<style lang="postcss">
	dt {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.375rem;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing);
		color: hsla(var(--hsl-text-light));
		--icon-size: 1.25em;

		@media (--viewport-sm-down) {
			gap: 0.25rem;
			margin-bottom: 0.25rem;
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--f-ui-xs-spacing);
		}
	}
</style>
