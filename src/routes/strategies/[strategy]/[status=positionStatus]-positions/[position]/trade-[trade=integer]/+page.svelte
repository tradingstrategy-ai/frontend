<script lang="ts">
	import { formatBPS } from 'trade-executor/helpers/formatters';
	import {
		formatAmount,
		formatPercent,
		formatPrice,
		formatPriceDifference,
		formatTimeDiffMinutesSeconds
	} from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { Alert, Button, DataBox, DataBoxes, PageHeading, Timestamp } from '$lib/components';
	import TransactionTable from './TransactionTable.svelte';
	import HashAddress from '$lib/components/HashAddress.svelte';
	import PositionDataIndicator from '../PositionDataIndicator.svelte';

	export let data;

	const { chain, position, trade } = data;
</script>

<main class="ds-container trade-page">
	<PageHeading prefix="Trade #{trade.trade_id}">
		<span slot="title">
			{trade.direction}
			{trade.pair.base.token_symbol}
			{#if trade.trade_type === 'stop_loss'}
				<PositionDataIndicator lg text="stop-loss" />
			{/if}
		</span>
		<Button
			slot="cta"
			size="sm"
			label="View raw trade data"
			href="trade-{trade.trade_id}.json"
			target="_blank"
			on:click={(e) => e.currentTarget.blur()}
		/>
	</PageHeading>

	{#if trade.failed}
		<Alert size="md" status="error" title="Trade execution failed">
			<ul class="error-details">
				<li>Failure reason: <i>{trade.failedTx?.revert_reason ?? 'unknown'}</i></li>
				{#if trade.failedTx?.tx_hash}
					<li>
						<a href={getExplorerUrl(chain, trade.failedTx.tx_hash)} target="_blank" rel="noreferrer">
							View transaction
							<span class="hash-wrapper"><HashAddress address={trade.failedTx.tx_hash} /></span>
						</a>
					</li>
				{/if}
			</ul>
		</Alert>
	{/if}

	<DataBoxes>
		<DataBox label="Trading pair" size="md">
			<a class="trading-pair" href={position.pair.info_url}>
				{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
				<span class="swap-fee">{formatPercent(position.pair.fee)}</span>
			</a>
		</DataBox>

		<DataBox label="Time" size="sm">
			<table class="databox-table">
				<tbody>
					<tr>
						<td class="label">Cycle</td>
						<td>
							<Timestamp date={trade.opened_at} withTime withSeconds />
						</td>
						<td />
					</tr>

					<tr>
						<td class="label">Decision</td>
						<td>
							<Timestamp date={trade.started_at} withTime withSeconds />
						</td>
						<td class="delta">+{formatTimeDiffMinutesSeconds(trade.opened_at, trade.started_at)}</td>
					</tr>

					<tr>
						<td class="label">Execute</td>
						<td>
							<Timestamp date={trade.executed_at} withTime withSeconds />
						</td>
						<td class="delta">+{formatTimeDiffMinutesSeconds(trade.started_at, trade.executed_at)}</td>
					</tr>
				</tbody>
			</table>
		</DataBox>

		<DataBox label="Price" size="sm">
			<table class="databox-table">
				<tbody>
					<tr>
						<td>Mid</td>
						<td>{formatPrice(trade.price_structure?.mid_price)}</td>
						<td />
					</tr>

					<tr>
						<td>Expected</td>
						<td>{formatPrice(trade.planned_price)}</td>
						<td class="delta">
							{formatPriceDifference(trade.price_structure?.mid_price, trade.planned_price)}
						</td>
					</tr>

					<tr>
						<td>Executed</td>
						<td>{formatPrice(trade.executed_price)}</td>
						<td class="delta">
							{formatPriceDifference(trade.planned_price, trade.executed_price)}
						</td>
					</tr>
				</tbody>
			</table>
		</DataBox>

		<DataBox label="Quantity" size="sm">
			<table class="databox-table">
				<tbody>
					<tr>
						<td>Expected</td>
						<td>
							{formatAmount(trade.planned_quantity)}
							{trade.pair.base.token_symbol}
						</td>
						<td>{formatPrice(trade.planned_reserve)}</td>
					</tr>
					<tr>
						<td>Executed</td>
						<td>
							{formatAmount(trade.executed_quantity)}
							{trade.pair.base.token_symbol}
						</td>
						<td>{formatPrice(trade.executed_reserve)}</td>
					</tr>
				</tbody>
			</table>
		</DataBox>

		<DataBox label="Slippage" size="sm">
			<table class="databox-table">
				<tbody>
					<tr>
						<td>Tolerance</td>
						<td>{formatBPS(trade.planned_max_slippage)} BPS</td>
					</tr>
					<tr>
						<td>Realised</td>
						<td>-</td>
					</tr>
				</tbody>
			</table>
		</DataBox>
	</DataBoxes>

	<TransactionTable {chain} transactions={trade.blockchain_transactions} />
</main>

<style lang="postcss">
	.trade-page {
		[slot='title'] {
			display: flex;
			align-items: center;
			gap: var(--space-md);
		}

		.error-details a {
			font-weight: 500;

			.hash-wrapper {
				display: inline-grid;
				text-decoration: inherit;
			}
		}

		.trading-pair {
			font-weight: bold;
			& .swap-fee {
				color: hsl(var(--hsl-text-extra-light));
			}
		}

		:global(.data-boxes) {
			margin-block: var(--space-md) var(--space-5xl);

			@media (--viewport-sm-down) {
				margin-bottom: var(--space-xl);
			}

			@media (--viewport-md-up) {
				grid-template-columns: 1fr 1fr;
			}
		}

		:global(.data-box) {
			align-content: flex-start;

			&:first-child {
				grid-column: 1/-1;
			}
		}

		.databox-table {
			--border-spacing: var(--space-sm);

			@media (--viewport-lg-up) {
				--border-spacing: var(--space-sl);
			}

			td {
				height: auto !important;
				padding: var(--space-sm) var(--space-xs);
				font: var(--f-ui-xs-medium);
				letter-spacing: var(--f-ui-xs-spacing, normal);
				/* white-space: nowrap; */

				@media (--viewport-lg-up) {
					font: var(--f-ui-sm-medium);
					letter-spacing: var(--f-ui-sm-spacing, normal);
				}

				&:first-child {
					padding-left: var(--space-sl);
					color: hsl(var(--hsl-text-extra-light));
				}

				&:last-child {
					padding-right: var(--space-sl);
				}

				&:not(:first-child) {
					text-align: right;
				}

				&.delta {
					font-weight: normal;
				}
			}
		}
	}
</style>
