<!--
@component
Render the statistics from the portfolio server-side calculated state.
-->
<script lang="ts">
	import { formatDollar, formatDuration, formatPercent } from '$lib/helpers/formatters';

	// TODO: Type define in some point
	// See trade_analyzer.py TradeSummary class
	export let latestStats: any;

	// Translate raw variables from TradeSummary Python class
	const summaryLabels = {
		duration: ['Trade period', formatDuration],
		realised_profit: ['Realised profit', formatDollar],
		open_value: ['Open positions', formatDollar],
		return_percent: ['Return %', formatPercent],
		annualised_return_percent: ['Annualised Return %', formatPercent],
		total_trades: ['Total trades'],
		won: ['Trades won'],
		lost: ['Trades lost'],
		stop_losses: ['Stop losses triggered'],
		zero_loss: ['Positions closed neutral'],
		average_winning_trade_profit_pc: ['Average winning trade profit %', formatPercent],
		biggest_winning_trade_pc: ['Biggest winning trade %', formatPercent],
		biggest_losing_trade_pc: ['Biggest losing trade %', formatPercent]
	};

	function translateSummary(tradeSummary) {
		const result = {};

		if (!tradeSummary) {
			return result;
		}

		for (let key in summaryLabels) {
			const val = tradeSummary[key];
			const [label, formatter] = summaryLabels[key];
			result[label] = formatter ? formatter(val) : val;
		}

		return result;
	}

	// See TradeSummary in trade_summary.py
	$: summary = translateSummary(latestStats?.summary);
</script>

{#if summary}
	<!-- TODO: convert to SummaryBox -->
	<table>
		{#each Object.entries(summary) as [label, value]}
			<tr>
				<th>{label}</th>
				<td>{value}</td>
			</tr>
		{/each}
	</table>
{/if}
