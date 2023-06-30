<!--

    Display one key metric in a strategy tile.

    - Key metric can come from backtest or live data

    - Key metric may contain a help link

   See https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/summary.py for data structures
 -->
<script lang="ts">
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { formatDatetime, formatPriceChange, formatUnixTimestampAsISODate } from '$lib/helpers/formatters';
	import KeyMetricTooltip from './KeyMetricTooltip.svelte';

	export let metric;
	export let name: string;
	export let formatter: (val: any) => string = null;
	export let colouredPercent = false;

	const value = metric?.value;

	const formattedValue = formatter ? formatter(value) : value;
</script>

<div class="key-metric" data-testid={`key-metric-${metric?.kind}`}>
	<dt>
		{name}
	</dt>
	<dd class={colouredPercent ? determinePriceChangeClass(value) : null}>
		<span data-testid={`key-metric-${metric?.kind}-value`}>
			{#if colouredPercent}
				{formatPriceChange(value)}
			{:else}
				{formattedValue}
			{/if}
		</span>

		{#if metric?.value}
			{#if metric?.source == 'backtesting'}
				<KeyMetricTooltip icon="history" iconClass="icon-warning">
					<p>
						This strategy has not been running long enough to display <a target="_blank" href={metric?.help_link}
							>{name}
						</a>
						based on the live trade execution data. Instead, a
						<a href="https://tradingstrategy.ai/glossary/backtest" target="_blank">backtested</a> estimation is displayed.
					</p>

					<p>
						The period used for the backtest simulation is
						<span class="timespan">
							{formatUnixTimestampAsISODate(metric.calculation_window_start_at)}—{formatUnixTimestampAsISODate(
								metric.calculation_window_end_at
							)}</span
						>.
					</p>

					<p>
						See <a target="_blank" href={metric?.help_link}>{name} </a> in glossary on more information what this metric
						means and how it is calculated.
					</p>

					<p>Past performance is no guarantee of future results.</p>
				</KeyMetricTooltip>
			{:else}
				<KeyMetricTooltip icon="question-circle">
					<p>This metric is based on the live trade execution for the duration the strategy had been running.</p>

					<p>
						See <a target="_blank" href={metric?.help_link}>{name} </a> in glossary on more information what this metric
						means and how it is calculated.
					</p>

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
	}

	dt {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}

	dd {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-xl-spacing, normal);
		margin: 0;
		display: flex;
		gap: var(--space-ss);
	}

	.timespan {
		white-space: nowrap;
	}
</style>
