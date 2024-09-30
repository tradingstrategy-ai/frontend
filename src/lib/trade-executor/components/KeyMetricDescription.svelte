<script lang="ts">
	import type { KeyMetric } from 'trade-executor/statistics/key-metric';
	import { Timestamp } from '$lib/components';

	// Tooltip title
	export let title: string;

	// Metric we are describing
	export let metric: KeyMetric | undefined;

	// See strategy-metric-help-texts
	export let extraDescription: string | undefined;

	export let backtestLink: string | undefined = undefined;
</script>

<div class="strategy-data-description ds-3">
	<h3>{title}</h3>

	<ul>
		{#if extraDescription}
			<li>
				{extraDescription}.
			</li>
		{/if}

		{#if metric?.help_link}
			<li>
				See the glossary for the definition of
				<a target="_blank" href={metric.help_link}><strong>{title}</strong></a>
				and how it is calculated.
			</li>
		{/if}

		{#if metric?.source == 'backtesting'}
			<li>
				This strategy has not been trading long enough to reliably calculate
				<a target="_blank" href={metric.help_link}>{title}</a> based on the live trading data.
			</li>

			<li>
				Instead, a <a href="/glossary/backtest">backtested</a> estimation is displayed.
			</li>

			{#if backtestLink}
				<li>
					<a href={backtestLink}>View the backtest results for this strategy</a>.
				</li>
			{/if}

			<li>
				The period used for the backtest simulation is
				<span class="timespan">
					<Timestamp date={metric.calculation_window_start_at} />—<Timestamp
						date={metric.calculation_window_end_at}
					/></span
				>.
			</li>
		{:else if metric?.calculation_method == 'historical_data'}
			<li>
				The calculation period for live trading is
				<span class="timespan">
					<Timestamp date={metric.calculation_window_start_at} />—<Timestamp
						date={metric.calculation_window_end_at}
					/></span
				>.
			</li>
		{:else}
			<li>This is the latest real-time value from the live trade execution</li>
		{/if}
	</ul>

	<p class="disclaimer">Past performance is no guarantee of future results.</p>
</div>

<style>
	h3 {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--ls-ui-md);
	}

	ul {
		display: grid;
		gap: 0.625rem;
		margin-block: 1rem;
	}

	:is(strong, .timespan) {
		font-weight: 700;
	}
</style>
