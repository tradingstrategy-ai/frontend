<script lang="ts">
	import { getPositionLatestStats } from 'trade-executor-frontend/state/stats';
	import { formatDollar, formatProfitability, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitability } from 'trade-executor-frontend/helpers/profit';
	import { formatDuration } from '$lib/helpers/formatters';
	import { getValueAtOpen, getValueAtPeak, getValueAtClose } from 'trade-executor-frontend/state/positionHelpers';
	import { AlertList, AlertItem, DataBox, DataBoxes, PageHeading, Timestamp, UpDownIndicator } from '$lib/components';
	import TradeTable from './TradeTable.svelte';
	import StopLossIndicator from './StopLossIndicator.svelte';

	export let data;

	const { summary, state, position } = data;
	const currentStats = getPositionLatestStats(position.position_id, state.stats);
	const positionStats = state.stats.positions[position.position_id];
	const trades = Object.values(position.trades);
	const hasFailedTrades = trades.some((trade) => trade.failed_at);
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1><a href="/strategies/{summary.id}">{summary.name}</a></h1>
		<h2>Position #{position.position_id}</h2>
	</PageHeading>

	<section>
		<DataBoxes>
			<DataBox label="Pair">
				<a href={position.pair.info_url}>
					{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
				</a>
			</DataBox>

			<DataBox label="Opened">
				<Timestamp date={position.opened_at} format="iso" withTime />
			</DataBox>

			{#if position.closed_at}
				<DataBox label="Closed">
					<Timestamp date={position.closed_at} format="iso" withTime />
				</DataBox>
				<DataBox label="Duration" value={formatDuration(position.closed_at - position.opened_at)} />
			{/if}

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

			{#if position.closed_at}
				<DataBox label="Last revaluation">
					<Timestamp date={position.last_pricing_at} format="iso" withTime />
				</DataBox>
				<DataBox label="Value at open" value={formatDollar(getValueAtOpen(positionStats))} />
				<DataBox label="Value before close" value={formatDollar(getValueAtClose(positionStats))} />
			{:else}
				<DataBox label="Quantity">
					{formatTokenAmount(currentStats?.quantity)}
					{position.pair.base.token_symbol}
				</DataBox>
				<DataBox label="Value now" value={formatDollar(currentStats?.value)} />
			{/if}

			<DataBox label="Highest value" value={formatDollar(getValueAtPeak(positionStats))} />

			<DataBox label="Buy price">
				{formatDollar(trades[0].executed_price)}
			</DataBox>

			<DataBox label="Sell price">
				{formatDollar(trades.at(-1).executed_price)}
			</DataBox>
		</DataBoxes>

		{#if hasFailedTrades}
			<AlertList status="error">
				<AlertItem title="Error">This position has one or more failed trades.</AlertItem>
			</AlertList>
		{/if}

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
</style>
