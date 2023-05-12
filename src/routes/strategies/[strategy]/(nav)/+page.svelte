<script lang="ts">
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';
	import { getPortfolioLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { AlertList, AlertItem, Button, SummaryBox, DataBox } from '$lib/components';
	import WalletWidget from '$lib/components/WalletWidget.svelte';
	import ConnectedWallet from './ConnectedWallet.svelte';
	import DepositStatus from './DepositStatus.svelte';

	export let data;
	export let isWalletConnected = true;

	$: portfolioStats = getPortfolioLatestStats(data.state);
	$: lastValuationDate = portfolioStats ? fromUnixTime(portfolioStats.calculated_at) : null;
	$: totalProfit = portfolioStats ? portfolioStats.unrealised_profit_usd + portfolioStats.realised_profit_usd : null;

	// FIXME: temporary hack; remove once `chainId` has been added to `metadata`
	function getChainId({ portfolio }: any) {
		const position = Object.values(portfolio?.closed_positions)[0];
		return position?.reserve_currency?.chain_id;
	}
</script>

<div class="strategy-overview-page">
	<SummaryBox class="invest-box" title="Invest">
		{#if isWalletConnected}
			<div class="widgets">
				<ConnectedWallet />
				<DepositStatus />
			</div>
		{/if}
		<div class="investor-actions">
			<Button
				href="/wizard/connect-wallet?returnTo=/strategies/{data.summary.id}&chainId={getChainId(data.state)}"
				label="Change wallet"
				disabled={!isWalletConnected}
			/>
			<Button
				href="/wizard/deposit?returnTo=/strategies/{data.summary.id}&chainId={getChainId(data.state)}"
				label="Deposit"
				disabled={!isWalletConnected}
			/>
			<Button
				href="/wizard/redeem?returnTo=/strategies/{data.summary.id}&chainId={getChainId(data.state)}"
				label="Redeem"
				disabled={!isWalletConnected}
			/>
		</div>
	</SummaryBox>

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

	.investor-actions {
		display: grid;
		gap: var(--space-ml);
		grid-template-columns: repeat(3, 1fr);
		min-height: 3.25rem;
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}

	.strategy-overview-page :global .invest-box {
		& > .main > header {
			margin-bottom: var(--space-sm);
		}

		& .grid {
			@media (--viewport-md-down) {
				--grid-gap: var(--space-sl) !important;
			}
		}

		& .summary-box .inner {
			gap: var(--space-sl);
		}
	}

	.widgets {
		display: grid;
		gap: var(--space-lg);

		@media (--viewport-md-up) {
			grid-template-columns: 1fr 2fr;
		}
	}

	.summary-stats {
		display: grid;
		gap: inherit;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		place-items: start stretch;
	}

	.strategy-overview-page :global .invest-box {
		& header .cta {
			display: unset !important;
		}

		& .wallet-widget {
			width: 100%;

			/* @media (--viewport-md-down) {
				margin: var(--space-sm) 0;
			} */

			@media (--viewport-md-up) {
				max-width: 24rem;
			}
		}
	}
</style>
