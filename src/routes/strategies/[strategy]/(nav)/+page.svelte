<script lang="ts">
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDaysAgo, formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { Alert, SummaryBox, DataBox } from '$lib/components';
	import { InvestorWidget } from '$lib/wallet';

	export let data;

	$: ({ chain, summary, state } = data);

	$: portfolioStats = getPortfolioLatestStats(state);
	$: lastValuationDate = portfolioStats ? fromUnixTime(portfolioStats.calculated_at) : null;
	$: totalProfit = portfolioStats ? portfolioStats.unrealised_profit_usd + portfolioStats.realised_profit_usd : null;
	$: returnAllTime = data?.summary?.summary_statistics?.return_all_time;
	$: age = data?.summary?.summary_statistics?.key_metrics?.started_at?.value;
</script>

<svelte:head>
	<title>{summary.name} | Trading Strategy</title>
	<meta name="description" content={summary.long_description} />
</svelte:head>

<div class="strategy-overview-page">
	<InvestorWidget strategy={summary} {chain} />

	<section class="summary-stats">
		{#if portfolioStats}
			<SummaryBox title="Assets">
				<DataBox label="Total assets" value={formatDollar(portfolioStats.total_equity)} />
				<DataBox label="Cash" value={formatDollar(portfolioStats.free_cash)} />
			</SummaryBox>

			<SummaryBox title="Performance">
				<DataBox
					label="Lifetime realised profit and losses"
					value={formatPercent(returnAllTime)}
					valueClass={determinePriceChangeClass(returnAllTime)}
				/>
				<DataBox
					label="Current unrealised profit and losses"
					value={formatDollar(portfolioStats.unrealised_profit_usd)}
					valueClass={determinePriceChangeClass(portfolioStats.unrealised_profit_usd)}
				/>

				<DataBox label="Live trading" value={formatDaysAgo(age)} />
			</SummaryBox>
		{:else}
			<Alert>Strategy overview data not available.</Alert>
		{/if}
	</section>
</div>

<style lang="postcss">
	.strategy-overview-page {
		display: grid;
		gap: var(--space-ls);

		@media (--viewport-md-down) {
			gap: var(--space-lg);
		}
	}

	.summary-stats {
		display: grid;
		gap: inherit;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		place-items: start stretch;
	}
</style>
