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
	import { Timestamp } from '$lib/components';
	import KeyMetricTooltip from './KeyMetricTooltip.svelte';
	import Badge from "./Badge.svelte";

	export let metric: Record<string, any>;
	export let name: string;
	export let formatter: Formatter<any> | undefined = undefined;

	const value = metric?.value;
	const formattedValue = formatter ? formatter(value) : value;

</script>

<div class="key-metric" data-testid={`key-metric-${metric?.kind}`}>
	<dt>
		{name}
	</dt>
	<dd>
		{#if metric?.value}
			{#if metric?.source == 'backtesting'}
				<KeyMetricTooltip>
					<span slot="tooltip-trigger">
						<span class="tooltip-trigger-content">
							<span class="value" data-testid={`key-metric-${metric?.kind}-value`}>
								<slot>{formattedValue}</slot>
							</span>
							<Badge text="backtested"/>
						</span>
					</span>

					<div slot="tooltip-popup">

						<h4>{name}</h4>

						<ul>
							{#if metric?.help_link}
								<li>
									See the glossary for the definition of <a target="_blank" href={metric?.help_link}>{name}</a>
									and how it is calculated.
								</li>

								<li>
									This strategy has not been trading long enough to reliable calculate
									<a target="_blank" href={metric?.help_link}>{name}</a> based on the live trading data.
								</li>

								<li>
									Instead, a <a target="_blank" href="https://tradingstrategy.ai/glossary/backtest">backtested</a>
									estimation is displayed. See <a href="https://tradingstrategy.ai/glossary/backtest">backtest results</a>.
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
							{/if}

						</ul>

						<p class="disclaimer">Past performance is no guarantee of future results.</p>
					</div>
				</KeyMetricTooltip>
			{:else}
				<KeyMetricTooltip text="live" colourScheme="grey">
					<p>This metric is based on the live trade execution for the duration the strategy had been running.</p>

					{#if metric?.help_link}
						<p>
							See <a target="_blank" href={metric?.help_link}>{name}</a>
							in glossary on more information what this metric means and how it is calculated.
						</p>
					{/if}

					<p>Past performance is no guarantee of future results.</p>
				</KeyMetricTooltip>
			{/if}
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

		& .tooltip-trigger-content {
			cursor: pointer;
		}

		& .value {
			border-bottom: 1px dotted black;
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
