<!--
@component
Render the statistics from the portfolio server-side calculated state.
-->
<script lang="ts">
	import { formatDollar, formatDuration, formatPercent } from '$lib/helpers/formatters';
	import { DataBox, SummaryBox } from '$lib/components';

	// TODO: Eventually migrated away
	// Old statistics
	// See trade_analyzer.py TradeSummary class
	export let oldLatestStats: any;

	// See StrategySummaryStatistics in
	// https://github.com/tradingstrategy-ai/trade-executor/blob/b3b2181acca90cc9873bb0ebf0778095e5c80523/tradeexecutor/strategy/summary.py#L148
	export let summaryStatistics: any;

	// TODO: Will be eventually migrated away
	$: summary = oldLatestStats?.summary || {};

	// compatibility layer for old property name in TradeSummary (remove after 01.04.2023)
	$: summary.total_positions ??= summary.total_trades;

</script>

{#if summary}
	<SummaryBox title="Performance summary">
		<div class="summary-statistics">
			<DataBox size="sm" label="Trade period" value={formatDuration(summary.duration)} />
			<DataBox size="sm" label="Realised profit" value={formatDollar(summary.realised_profit)} />
			<DataBox size="sm" label="Open positions" value={formatDollar(summary.open_value)} />
			<DataBox size="sm" label="Lifetime return" value={formatPercent(summaryStatistics?.return_all_time)} />
			<DataBox size="sm" label="Annualised return" value={formatPercent(summaryStatistics?.return_annualised)} />
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
