<script lang="ts">
	import type { BlockchainTransaction } from 'trade-executor-frontend/state/interface';
	import { formatAmount, formatBPS } from 'trade-executor-frontend/helpers/formatters';
	import { formatPrice } from '$lib/helpers/formatters';
	import { Alert, DataBox, DataBoxes, PageHeading, Timestamp } from '$lib/components';
	import { tradeType } from '$lib/helpers/trade';
	import StopLossIndicator from '../StopLossIndicator.svelte';
	import TransactionTable from './TransactionTable.svelte';
	import HashAddress from '$lib/components/HashAddress.svelte';

	export let data;

	const { chain, position, trade } = data;

	const tradeFailed = trade.failed_at !== null;

	// Trade should have only one failed transactions and it is the first one that reverted
	const failedTx = trade.blockchain_transactions.find((tx: BlockchainTransaction) => tx.revert_reason !== null);
	const errorExplorerUrl = failedTx && `${chain.chain_explorer}/tx/${failedTx?.tx_hash}`;
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1>Trade #{trade.trade_id}</h1>
		<h2>
			{tradeType(trade)}
			{trade.pair.base.token_symbol}
			{#if trade.trade_type === 'stop_loss'}
				<StopLossIndicator lg />
			{/if}
		</h2>
	</PageHeading>

	{#if tradeFailed}
		<Alert size="md" status="error" title="Trade execution failed">
			<ul class="error-details">
				<li>Failure reason: <i>{failedTx.revert_reason}</i></li>
				<li>
					<a href={errorExplorerUrl} target="_blank" rel="noreferrer">
						View transaction
						<span class="hash-wrapper"><HashAddress address={failedTx.tx_hash} /></span>
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
		<DataBox label="Executed at">
			<Timestamp date={trade.executed_at} format="iso" withTime />
		</DataBox>
		<DataBox label="Slippage tolerance" value="{formatBPS(trade.planned_max_slippage)} BPS" />
		<DataBox label="Expected value" value={formatPrice(trade.planned_reserve)} />
		<DataBox label="Realized value" value={formatPrice(trade.executed_reserve)} />
		<DataBox label="Liquidity provider fees" value="N/A" />
		<DataBox label="Expected quantity">
			{formatAmount(Number(trade.planned_quantity))}
			{trade.pair.base.token_symbol}
		</DataBox>
		<DataBox label="Realized quantity">
			{formatAmount(Number(trade.executed_quantity))}
			{trade.pair.base.token_symbol}
		</DataBox>
		<DataBox label="Gas fees" value="N/A" />
		<DataBox label="Price" value={formatPrice(trade.executed_price)} />
	</DataBoxes>

	<TransactionTable {chain} transactions={trade.blockchain_transactions} />
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

	.error-details a {
		font-weight: 500;

		& .hash-wrapper {
			display: inline-grid;
		}
	}
</style>
