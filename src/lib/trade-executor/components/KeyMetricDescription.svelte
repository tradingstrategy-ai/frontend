<script lang="ts">
	import type { KeyMetric } from 'trade-executor/strategy/runtime-state';
	import { Timestamp } from '$lib/components';

	export let title: string;
	export let metric: KeyMetric | undefined;
	export let strategyId: string;

	const backtestLink = `/strategies/${strategyId}/backtest`;
</script>

<div class="strategy-data-description ds-3">
	<h3>{title}</h3>

	<ul>
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
				Instead, a <a href={backtestLink}>backtested</a> estimation is displayed.
			</li>

			<li>
				<a href={backtestLink}>Read the backtest report</a>.
			</li>

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

<style lang="postcss">
	h3 {
		font: var(--f-ui-xl-medium);
		margin-bottom: 0.75rem !important;
	}

	ul {
		margin-block: 1rem;
	}

	ul li {
		margin-bottom: 0.75rem;
	}

	strong {
		font-weight: 700;
	}

	.timespan {
		font-weight: 700;
	}
</style>
