<script lang="ts">
	import type { PageData } from './$types';
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { AlertList, AlertItem, SummaryBox, SummaryBoxItem } from '$lib/components';

	export let data: PageData;

	$: portfolioStats = getPortfolioLatestStats(data.state);
	$: lastValuationDate = portfolioStats ? fromUnixTime(portfolioStats.calculated_at) : null;
	$: totalProfit = portfolioStats ? portfolioStats.unrealised_profit_usd + portfolioStats.realised_profit_usd : null;
</script>

<section>
	{#if portfolioStats}
		<SummaryBox title="Current">
			<SummaryBoxItem label="Value in trading positions" value={formatDollar(portfolioStats.total_equity)} />
			<SummaryBoxItem label="Cash" value={formatDollar(portfolioStats.free_cash)} />
			<SummaryBoxItem label="Last valuation">
				<time datetime={lastValuationDate?.toISOString()} title={lastValuationDate?.toISOString()}>
					{formatDistanceToNow(lastValuationDate, { addSuffix: true })}
				</time>
			</SummaryBoxItem>
		</SummaryBox>

		<SummaryBox title="Performance">
			<SummaryBoxItem
				label="Current profit"
				value={formatDollar(totalProfit)}
				valueClass={determinePriceChangeClass(totalProfit)}
			/>
			<SummaryBoxItem
				label="Unrealised profit"
				value={formatDollar(portfolioStats.unrealised_profit_usd)}
				valueClass={determinePriceChangeClass(portfolioStats.unrealised_profit_usd)}
			/>
			<SummaryBoxItem
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

<style lang="postcss">
	section {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(auto-fit, minmax(16rem, auto));
		padding-top: 1.25rem;

		@media (--viewport-md-down) {
			gap: 1.5rem;
		}
	}
</style>
