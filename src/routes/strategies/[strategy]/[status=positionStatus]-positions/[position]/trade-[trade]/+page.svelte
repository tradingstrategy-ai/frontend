<script lang="ts">
	import type { PageData } from './$types';
	import { formatDollar, formatAmount, formatBPS } from 'trade-executor-frontend/helpers/formatters';
	import { DataBox, DataBoxes, PageHeading, Timestamp } from '$lib/components';
	import StopLossIndicator from '../StopLossIndicator.svelte';
	import TransactionTable from './TransactionTable.svelte';

	export let data: PageData;

	const { position, trade } = data;
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1>Trade #{trade.trade_id}</h1>
		<h2>
			{trade.planned_quantity > 0 ? 'Buy' : 'Sell'}
			{trade.pair.base.token_symbol}
			{#if trade.trade_type === 'stop_loss'}
				<StopLossIndicator lg />
			{/if}
		</h2>
	</PageHeading>

	<DataBoxes>
		<DataBox label="Pair">
			<a href={position.pair.info_url}>
				{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
			</a>
		</DataBox>
		<DataBox label="Executed at">
			<Timestamp date={trade.executed_at} format="iso" withTime />
		</DataBox>
		<DataBox label="Slippage tolerance" value="{formatBPS(trade.planned_max_slippage)} BPS" />
		<DataBox label="Expected value" value={formatDollar(trade.planned_reserve)} />
		<DataBox label="Realized value" value={formatDollar(trade.executed_reserve)} />
		<DataBox label="Liquidity provider fees" value="N/A" />
		<DataBox label="Expected quantity">
			{formatAmount(Number(trade.planned_quantity))}
			{trade.pair.quote.token_symbol}
		</DataBox>
		<DataBox label="Realized quantity">
			{formatAmount(Number(trade.executed_quantity))}
			{trade.pair.quote.token_symbol}
		</DataBox>
		<DataBox label="Gas fees" value="N/A" />
	</DataBoxes>

	<TransactionTable transactions={trade.blockchain_transactions} />
</main>

<style lang="postcss">
	h2 {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	main :global .data-boxes {
		margin-block: var(--space-md) var(--space-5xl);

		@media (--viewport-sm-down) {
			margin-bottom: var(--space-xl);
		}
	}
</style>
