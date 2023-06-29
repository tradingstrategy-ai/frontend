<!--

    Display one key metric in a strategy tile.

    - Key metric can come from backtest or live data

    - Key metric may contain a help link

   See https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/summary.py for data structures
 -->
<script lang="ts">

  import {determinePriceChangeClass} from "$lib/helpers/price";
  import {formatDatetime, formatPriceChange} from "$lib/helpers/formatters";
  import KeyMetricTooltip from './KeyMetricTooltip.svelte';

  export let metric;
  export let name: string;
  export let formatter: (val: any) => string = null;
  export let colouredPercent = false;

  const value = metric?.value;

  const formattedValue = formatter ? formatter(value) : value;

</script>

<div>
    <dt>
        {name}
    </dt>
    <dd class={colouredPercent ? determinePriceChangeClass(value) : null}>
        {#if colouredPercent}
            {formatPriceChange(value)}
        {:else}
            {formattedValue}
        {/if}

        {#if metric?.source == "backtesting"}
                <KeyMetricTooltip title="(bt)">
                    <p>
                        The strategy does not have enough live trading data to display the key metric
                        based on the live execution.
                    </p>

                    <p>
                        The backtest period used for the calculation is
                        {formatDatetime(metric.calculation_window_start_at)}
                        —
                        {formatDatetime(metric.calculation_window_end_at)}.
                    </p>

                    <p>
                        Past performance is no guarantee of future results.
                    </p>

                    <p>
                        See <a target="_blank" href={metric?.help_link}>{title} in Defi and Trading glossary</a>
                        on more information what this metric means and how it is calculated.
                    </p>
                </KeyMetricTooltip>
            {:else}
                <KeyMetricTooltip title="(?)">
                    <p>
                        This metric is based on the live trade execution for the duration the strategy had been running.
                    </p>

                    <p>
                        Past performance is no guarantee of future results.
                    </p>
                </KeyMetricTooltip>
        {/if}
    </dd>

</div>


<style lang="postcss">
	dt {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}

	dd {
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing, normal);
		margin: 0;
		display: flex;
		gap: var(--space-ss);

		@nest .hasError & {
			color: var(--c-text-ultra-light);
		}
	}
</style>