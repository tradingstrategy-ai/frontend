<script lang="ts">
	import type { BlockchainTransaction } from 'trade-executor/state/interface';
	import { formatBPS } from 'trade-executor/helpers/formatters';
	import {
		formatAmount,
		formatPrice,
		formatPriceDifference,
		formatTimeDiffMinutesSeconds
	} from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { tradeDirection } from 'trade-executor/helpers/trade';
	import { Alert, DataBox, DataBoxes, PageHeading, Timestamp } from '$lib/components';
	import TransactionTable from './TransactionTable.svelte';
	import HashAddress from '$lib/components/HashAddress.svelte';
	import PositionDataIndicator from '../PositionDataIndicator.svelte';

	export let data;

	const { chain, position, trade } = data;

	const tradeFailed = trade.failed_at !== null;
	// Trade should have only one failed transactions and it is the first one that reverted
	const failedTx = trade.blockchain_transactions.find((tx: BlockchainTransaction) => tx.revert_reason !== null);

	console.log(trade);
</script>

<main class="ds-container trade-page">
	<PageHeading level={2}>
		<h1>Trade #{trade.trade_id}</h1>
		<h2>
			{tradeDirection(trade)}
			{trade.pair.base.token_symbol}
			{#if trade.trade_type === 'stop_loss'}
				<PositionDataIndicator lg text="stop-loss" />
			{/if}
		</h2>
	</PageHeading>

	{#if tradeFailed}
		<Alert size="md" status="error" title="Trade execution failed">
			<ul class="error-details">
				<li>Failure reason: <i>{failedTx.revert_reason}</i></li>
				<li>
					<a href={getExplorerUrl(chain, failedTx.tx_hash)} target="_blank" rel="noreferrer">
						View transaction
						<span class="hash-wrapper"><HashAddress address={failedTx.tx_hash} /></span>
					</a>
				</li>
			</ul>
		</Alert>
	{/if}

	<DataBoxes>
		<DataBox label="Trading pair" size="sm">
			<a href={position.pair.info_url}>
				{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
			</a>
			<span>{position.pair.fee * 100}% fee</span>
		</DataBox>

		<DataBox label="Time" size="xs">
			<div class="databox-labeled">
				<label>Cycle</label>
				<Timestamp date={trade.opened_at} withTime withSeconds />

				<label>Decision</label>
				<span>
					<Timestamp date={trade.started_at} withTime withSeconds />
					(+{formatTimeDiffMinutesSeconds(trade.opened_at, trade.started_at)})
				</span>

				<label>Executed</label>
				<span>
					<Timestamp date={trade.executed_at} withTime withSeconds />
					(+{formatTimeDiffMinutesSeconds(trade.started_at, trade.executed_at)})
				</span>
			</div>
		</DataBox>

		<DataBox label="Price" size="xs">
			<div class="databox-labeled">
				<label>Mid</label>
				<span>
					{formatPrice(trade.price_structure.mid_price)}
				</span>

				<label>Expected</label>
				<span>
					{formatPrice(trade.planned_price)} ({formatPriceDifference(
						trade.price_structure.mid_price,
						trade.planned_price
					)})
				</span>

				<label>Executed</label>
				<span>
					{formatPrice(trade.executed_price)} ({formatPriceDifference(trade.planned_price, trade.executed_price)})
				</span>
			</div>
		</DataBox>

		<DataBox label="Quantity" size="xs">
			<div class="databox-labeled">
				<label>Expected</label>
				<span>
					{formatAmount(trade.planned_quantity)}
					{trade.pair.base.token_symbol}
				</span>

				<label>Executed</label>
				<span>
					{formatAmount(trade.executed_quantity)}
					{trade.pair.base.token_symbol}
				</span>
			</div>
		</DataBox>

		<DataBox label="Value" size="xs">
			<div class="databox-labeled">
				<label>Expected</label>
				<span>
					{formatPrice(trade.planned_reserve)}
				</span>

				<label>Executed</label>
				<span>
					{formatPrice(trade.executed_reserve)}
				</span>
			</div>
		</DataBox>

		<DataBox label="Slippage" size="xs">
			<div class="databox-labeled">
				<label>Tolerance</label>
				<span>
					{formatBPS(trade.planned_max_slippage)} BPS
				</span>

				<label>Realised</label>
				<span> - </span>
			</div>
		</DataBox>
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

		.hash-wrapper {
			display: inline-grid;
		}
	}

	.trade-page :global .data-box {
		align-content: flex-start;

		.value {
			display: grid;
			gap: var(--space-sm);
		}

		label {
			color: var(--c-text-extra-light);
		}
	}

	.databox-labeled {
		display: grid;
		grid-template-columns: 1fr 1fr;

		& span {
			white-space: nowrap;
		}

		gap: var(--space-sm);
	}
</style>
