<script lang="ts">
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { AlertList, AlertItem, SummaryBox, DataBox } from '$lib/components';
	import DepositStatus from './DepositStatus.svelte';

	export let data;

	$: portfolioStats = getPortfolioLatestStats(data.state);
	$: lastValuationDate = portfolioStats ? fromUnixTime(portfolioStats.calculated_at) : null;
	$: totalProfit = portfolioStats ? portfolioStats.unrealised_profit_usd + portfolioStats.realised_profit_usd : null;
</script>

<section>
	<DepositStatus />

	{#if portfolioStats}
		<SummaryBox title="Current">
			<DataBox label="Assets under management" value={formatDollar(portfolioStats.total_equity)} />
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

<style lang="postcss">
	section {
		display: grid;
		gap: var(--space-ls);
		place-items: start stretch;

		@media (--viewport-sm-up) {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-lg);
		}
	}

	section :global .summary-box:nth-child(1) {
		--inner-space: var(--space-ml);
		@media (--viewport-sm-up) {
			--inner-space: var(--space-lg);
			grid-column: 1/3;
		}

		& .content {
			padding: 0 0 var(--space-sm);
		}

		& .actions {
			display: grid;
			gap: var(--inner-space);
			grid-template-columns: repeat(auto-fit, minmax(min(20rem, 80vw), 1fr));
		}
	}
</style>
