<!--
@component
Render the statistics from the portfolio server-side calculated state.
-->
<script lang="ts">
	import { formatDollar, formatDuration, formatPercent } from '$lib/helpers/formatters';
	import { DataBox, SummaryBox } from '$lib/components';

	// See trade_analyzer.py TradeSummary class
	export let latestStats: any;

	$: summary = latestStats?.summary || {};

	// compatibility layer for old property name in TradeSummary (remove after 01.04.2023)
	$: summary.total_positions ??= summary.total_trades;

	console.log(latestStats);

</script>

{#if summary}
	<SummaryBox title="Performance summary">
		<div class="summary-statistics">
			<DataBox size="sm" label="Trade period" value={formatDuration(summary.duration)} />
			<DataBox size="sm" label="Realised profit" value={formatDollar(summary.realised_profit)} />
			<DataBox size="sm" label="Open positions" value={formatDollar(summary.open_value)} />
			<DataBox size="sm" label="Return %" value={formatPercent(summary.return_percent)} />
			<DataBox size="sm" label="Annualised Return %" value={formatPercent(summary.annualised_return_percent)} />
			<DataBox size="sm" label="Total positions" value={summary.total_positions} />
			<DataBox size="sm" label="Trades won" value={summary.won} />
			<DataBox size="sm" label="Trades lost" value={summary.lost} />
			<DataBox size="sm" label="Stop losses triggered" value={summary.stop_losses} />
			<DataBox size="sm" label="Positions closed neutral" value={summary.zero_loss} />
			<DataBox
				size="sm"
				label="Average winning trade profit %"
				value={formatPercent(summary.average_winning_trade_profit_pc)}
			/>
			<DataBox size="sm" label="Biggest winning trade %" value={formatPercent(summary.biggest_winning_trade_pc)} />
			<DataBox size="sm" label="Biggest losing trade %" value={formatPercent(summary.biggest_losing_trade_pc)} />
		</div>
	</SummaryBox>
{/if}

<style lang="postcss">
	.summary-statistics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: inherit;
	}
</style>
