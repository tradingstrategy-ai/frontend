<!--

    Summary statistics widget.

    Render the statistics from the portfolio server-side calculated state.

-->
<script lang="ts">
	import { formatDollar, formatDuration, formatPercent } from '$lib/helpers/formatters';

	// TODO: Type define in some point
	// See trade_analyzer.py TradeSummary class
	export let latestStats: any;

	// Translate raw variables from TradeSummary Python class
	const summaryLabels = {
		duration: ['Trade period', 'timedelta'],
		realised_profit: ['Realised profit', 'usd'],
		open_value: ['Open positions', 'usd'],
		return_percent: ['Return %', 'percent'],
		annualised_return_percent: ['Annualised Return %', 'percent'],
		total_trades: ['Total trades', 'int'],
		won: ['Trades won', 'int'],
		lost: ['Trades lost', 'int'],
		stop_losses: ['Stop losses triggered', 'int'],
		zero_loss: ['Positions closed neutral', 'int'],
		average_winning_trade_profit_pc: ['Average winning trade profit %', 'percent'],
		biggest_winning_trade_pc: ['Biggest winning trade %', 'percent'],
		biggest_losing_trade_pc: ['Biggest losing trade %', 'percent']
	};

	function translateSummary(tradeSummary) {
		const result = {};

		if (!tradeSummary) {
			return result;
		}

		for (let key in summaryLabels) {
			const val = tradeSummary[key];
			const label = summaryLabels[key][0];
			const type = summaryLabels[key][1];

			if (type == 'int') {
				result[label] = val;
			} else if (type == 'usd') {
				result[label] = formatDollar(val);
			} else if (type == 'percent') {
				result[label] = formatPercent(val);
			} else if (type == 'timedelta') {
				result[label] = formatDuration(val);
			} else {
				result[label] = val;
			}
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
