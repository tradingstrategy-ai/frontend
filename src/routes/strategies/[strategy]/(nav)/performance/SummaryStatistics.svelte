<!--
@component
Render the statistics from the portfolio server-side calculated state.
-->
<script lang="ts">
	import { formatDollar, formatDuration, formatPercent } from '$lib/helpers/formatters';
	import { DataBox, SummaryBox } from '$lib/components';

	// TODO: Eventually migrate away (when required stats are in summaryStatistics)
	// See trade_analyzer.py TradeSummary class
	export let oldLatestStats: any;

	// See StrategySummaryStatistics in
	// https://github.com/tradingstrategy-ai/trade-executor/blob/b3b2181acca90cc9873bb0ebf0778095e5c80523/tradeexecutor/strategy/summary.py#L148
	export let summaryStatistics: any;

	$: oldStatsSummary = oldLatestStats?.summary || {};
</script>

<SummaryBox title="Performance summary">
	<div class="summary-statistics">
		<DataBox size="sm" label="Trade period" value={formatDuration(oldStatsSummary.duration)} />
		<DataBox size="sm" label="Realised profit" value={formatDollar(oldStatsSummary.realised_profit)} />
		<DataBox size="sm" label="Open positions" value={formatDollar(oldStatsSummary.open_value)} />
		<DataBox size="sm" label="Lifetime return" value={formatPercent(summaryStatistics?.return_all_time)} />
		<DataBox size="sm" label="Annualised return" value={formatPercent(summaryStatistics?.return_annualised)} />
		<DataBox size="sm" label="Total positions" value={oldStatsSummary.total_positions} />
		<DataBox size="sm" label="Trades won" value={oldStatsSummary.won} />
		<DataBox size="sm" label="Trades lost" value={oldStatsSummary.lost} />
		<DataBox size="sm" label="Stop losses triggered" value={oldStatsSummary.stop_losses} />
		<DataBox size="sm" label="Positions closed neutral" value={oldStatsSummary.zero_loss} />
		<DataBox
			size="sm"
			label="Average winning trade profit %"
			value={formatPercent(oldStatsSummary.average_winning_trade_profit_pc)}
		/>
		<DataBox
			size="sm"
			label="Biggest winning trade %"
			value={formatPercent(oldStatsSummary.biggest_winning_trade_pc)}
		/>
		<DataBox size="sm" label="Biggest losing trade %" value={formatPercent(oldStatsSummary.biggest_losing_trade_pc)} />
	</div>
</SummaryBox>

<style lang="postcss">
	.summary-statistics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: inherit;
	}
</style>
