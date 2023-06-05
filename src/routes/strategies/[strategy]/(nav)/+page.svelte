<script lang="ts">
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { AlertList, AlertItem, SummaryBox, DataBox } from '$lib/components';
	import InvestorWidget from '$lib/wallet/InvestorWidget.svelte';

	export let data;
	$: ({ chain, summary, state } = data);

	$: portfolioStats = getPortfolioLatestStats(state);
	$: lastValuationDate = portfolioStats ? fromUnixTime(portfolioStats.calculated_at) : null;
	$: totalProfit = portfolioStats ? portfolioStats.unrealised_profit_usd + portfolioStats.realised_profit_usd : null;
</script>

<div class="strategy-overview-page">
	<InvestorWidget strategy={summary} {chain} />

	<section class="summary-stats">
		{#if portfolioStats}
			<SummaryBox title="Current">
				<DataBox label="Total assets" value={formatDollar(portfolioStats.total_equity)} />
				<DataBox label="Cash" value={formatDollar(portfolioStats.free_cash)} />
				<DataBox label="Last valuation">
					<time datetime={lastValuationDate?.toISOString()} title={lastValuationDate?.toISOString()}>
						{formatDistanceToNow(lastValuationDate, { addSuffix: true })}
					</time>
				</DataBox>
			</SummaryBox>

			<SummaryBox title="Performance">
				<DataBox
					label="Current profit"
					value={formatDollar(totalProfit)}
					valueClass={determinePriceChangeClass(totalProfit)}
				/>
				<DataBox
					label="Unrealised profit"
					value={formatDollar(portfolioStats.unrealised_profit_usd)}
					valueClass={determinePriceChangeClass(portfolioStats.unrealised_profit_usd)}
				/>
				<DataBox
					label="Realised profit"
					value={formatDollar(portfolioStats.realised_profit_usd)}
					valueClass={determinePriceChangeClass(portfolioStats.realised_profit_usd)}
				/>
			</SummaryBox>
		{:else}
			<AlertList>
				<AlertItem>Strategy overview data not available.</AlertItem>
			</AlertList>
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
