<!--
@component
Display one key metric in a strategy tile.
- Key metric can come from backtest or live data
- Key metric may contain a help link
- Optionally use default slot for custom formatting
- See https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/summary.py for data structures

#### Usage:
```tsx
<KeyMetric name="Total assets" metric={summaryStats?.key_metrics?.total_equity} formatter={formatDollar} />
```
-->
<script lang="ts">
	import { Badge, Timestamp } from '$lib/components';
	import KeyMetricTooltip from './KeyMetricTooltip.svelte';

	export let metric: Record<string, any>;
	export let name: string;
	export let formatter: Formatter<any> | undefined = undefined;
	export let backtestLink: string;

	$: value = metric?.value;
	$: formattedValue = formatter ? formatter(value) : value;
</script>

<div class="key-metric" data-testid={`key-metric-${metric?.kind}`}>
	<dt>
		{name}
	</dt>
	<dd>
		{#if value !== undefined}
			<KeyMetricTooltip>
				<svelte:fragment slot="tooltip-trigger">
					<span class="value" data-testid={`key-metric-${metric?.kind}-value`}>
						<slot {value}>{formattedValue}</slot>
					</span>

					{#if metric?.source === 'backtesting'}
						<Badge text="backtested" />
					{/if}
				</svelte:fragment>

				<svelte:fragment slot="tooltip-popup">
					<h4>{name}</h4>

					<ul>
						{#if metric?.help_link}
							<li>
								See the glossary for the definition of <a target="_blank" href={metric?.help_link}>{name}</a>
								and how it is calculated.
							</li>
						{/if}

						{#if metric?.source == 'backtesting'}
							<li>
								This strategy has not been trading long enough to reliable calculate
								<a target="_blank" href={metric?.help_link}>{name}</a> based on the live trading data.
							</li>

							<li>
								Instead, a <a href={backtestLink}>backtested</a> estimation is displayed.
							</li>

							<li>
								<a href={backtestLink}>Read the backtest report</a>.
							</li>

							<li>
								The period used for the backtest simulation is
								<span class="timespan">
									<Timestamp date={metric.calculation_window_start_at} format="iso" />—<Timestamp
										date={metric.calculation_window_end_at}
										format="iso"
									/></span
								>.
							</li>
						{:else if metric?.calculation_method == 'historical_data'}
							<li>
								The calculation period for live trading is
								<span class="timespan">
									<Timestamp date={metric.calculation_window_start_at} format="iso" />—<Timestamp
										date={metric.calculation_window_end_at}
										format="iso"
									/></span
								>.
							</li>
						{:else}
							<li>This is the latest real-time value from the live trade execution</li>
						{/if}
					</ul>

					<p class="disclaimer">Past performance is no guarantee of future results.</p>
				</svelte:fragment>
			</KeyMetricTooltip>
		{/if}
	</dd>
</div>

<style lang="postcss">
	.key-metric {
		display: grid;
		gap: var(--space-ss);

		& dt {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}

		& dd {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);
			margin: 0;
			display: flex;
			gap: var(--space-ss);
		}

		& .timespan {
			white-space: nowrap;
		}

		& .value {
			border-bottom: 1px dotted hsla(var(--hsl-text));
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);
			margin: 0;
			gap: var(--space-ss);
		}

		& h4 {
			font: var(--f-ui-large-medium);
			letter-spacing: var(--f-ui-xxl-spacing, normal);
		}

		& ul {
			margin: var(--space-ss) 0;

			& li {
				margin: var(--space-ss) 0;
			}
		}

		& .disclaimer {
			font: var(--f-ui-xsmall-light);
			color: var(--c-text-light);
		}

		& .timespan {
			font-weight: 500;
		}
	}
</style>
