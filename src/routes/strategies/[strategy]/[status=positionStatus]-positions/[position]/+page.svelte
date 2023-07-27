<script lang="ts">
	import { getPositionLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatProfitability, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitability } from 'trade-executor-frontend/helpers/profit';
	import {
		getValueAtOpen,
		getValueAtPeak,
		getValueAtClose,
		getPositionFreezeReason,
		isPositionInError
	} from 'trade-executor-frontend/state/position-helpers';
	import { formatDuration, formatPrice } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain-explorer';
	import { tradeDirection } from 'trade-executor-frontend/helpers/trade';
	import { Alert, DataBox, DataBoxes, HashAddress, PageHeading, Timestamp, UpDownIndicator } from '$lib/components';
	import TradeTable from './TradeTable.svelte';
	import StopLossIndicator from './StopLossIndicator.svelte';

	export let data;

	const { summary, state, position, chain } = data;
	const currentStats = getPositionLatestStats(position.position_id, state.stats);
	const positionStats = state.stats.positions[position.position_id];
	const trades = Object.values(position.trades);
	const positionFailed = isPositionInError(position);
	const positionErrorInfo = positionFailed && getPositionFreezeReason(position);


</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1><a href="/strategies/{summary.id}">{summary.name}</a></h1>
		<h2>Position #{position.position_id}</h2>
	</PageHeading>

	<section>
		{#if positionErrorInfo}
			<Alert size="md" status="error" title="This position is currently in an error state">
				<ul class="error-details">
					<li>Failure reason: <i>{positionErrorInfo.revertReason}</i></li>
					<li>
						<a href={`./${position.position_id}/trade-${positionErrorInfo.tradeId}`}
							>View failed trade #{positionErrorInfo.tradeId}</a
						>
					</li>
					<li>
						<a href={getExplorerUrl(chain, positionErrorInfo.txHash)} target="_blank" rel="noreferrer">
							View transaction
							<span class="hash-wrapper">
								<HashAddress address={positionErrorInfo.txHash} />
							</span>
						</a>
					</li>
				</ul>
			</Alert>
		{/if}

		<DataBoxes>
			<DataBox label="Pair">
				<a href={position.pair.info_url}>
					{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
				</a>
			</DataBox>

			<DataBox label="Profitability">
				<div class="profitability">
					<UpDownIndicator
						value={currentStats?.profitability}
						formatter={formatProfitability}
						compareFn={determineProfitability}
					/>
					{#if trades.some((t) => t.trade_type === 'stop_loss')}
						<StopLossIndicator />
					{/if}
				</div>
			</DataBox>

			<DataBox label="Opened">
				<Timestamp date={position.opened_at} format="iso" withTime />
			</DataBox>

			{#if position.closed_at}
				<DataBox label="Closed">
					<Timestamp date={position.closed_at} format="iso" withTime />
				</DataBox>
			{/if}

			<DataBox label="{tradeDirection(trades[0])} price">
				{formatPrice(trades[0].executed_price)}
			</DataBox>

			{#if position.closed_at}
				{@const lastTrade = trades.at(-1)}
				<DataBox label="{tradeDirection(lastTrade)} price">
					{formatPrice(lastTrade.executed_price)}
				</DataBox>
			{/if}

			{#if position.closed_at}
				<DataBox label="Duration" value={formatDuration(position.closed_at - position.opened_at)} />
				<DataBox label="Last revaluation">
					<Timestamp date={position.last_pricing_at} format="iso" withTime />
				</DataBox>
				<DataBox label="Value at open" value={formatPrice(getValueAtOpen(positionStats))} />
				<DataBox label="Value before close" value={formatPrice(getValueAtClose(positionStats))} />
			{:else}
				<DataBox label="Quantity">
					{formatTokenAmount(currentStats?.quantity)}
					{position.pair.base.token_symbol}
				</DataBox>
				<DataBox label="Value now" value={formatPrice(currentStats?.value)} />
			{/if}

			<DataBox label="Highest value" value={formatPrice(getValueAtPeak(positionStats))} />
		</DataBoxes>

		<TradeTable {trades} />
	</section>
</main>

<style lang="postcss">
	section {
		margin-top: var(--space-md);
		display: grid;
		gap: var(--space-5xl);

		@media (--viewport-sm-down) {
			gap: var(--space-xl);
		}
	}

	.profitability {
		display: flex;
		justify-content: space-between;
	}

	.error-details a {
		font-weight: 500;

		& .hash-wrapper {
			display: inline-grid;
		}
	}
</style>
