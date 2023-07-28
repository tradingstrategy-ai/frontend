<script lang="ts">
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDaysAgo, formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { Alert, SummaryBox, DataBox, UpDownIndicator } from '$lib/components';
	import { InvestorWidget } from '$lib/wallet';

	export let data;

	$: ({ chain, summary, state } = data);

	$: portfolioStats = getPortfolioLatestStats(state);
	$: returnAllTime = summary?.summary_statistics?.return_all_time;
	$: age = summary?.summary_statistics?.key_metrics?.started_at?.value;
	$: cashSymbol = Object.values(state?.portfolio?.reserves ?? {})[0]?.asset?.token_symbol;
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
				<DataBox label={`Cash (${cashSymbol})`} value={formatDollar(portfolioStats.free_cash)} />
			</SummaryBox>

			<SummaryBox title="Performance">
				<DataBox label="Lifetime realised profit and loss" value={returnAllTime} let:value>
					<UpDownIndicator {value} formatter={formatPercent} />
				</DataBox>
				<DataBox label="Current unrealised profit and loss" value={portfolioStats.unrealised_profit_usd} let:value>
					<UpDownIndicator {value} formatter={formatDollar} />
				</DataBox>
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
