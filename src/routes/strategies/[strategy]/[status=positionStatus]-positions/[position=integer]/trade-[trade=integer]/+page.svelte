<script lang="ts">
	import { formatBPS } from 'trade-executor/helpers/formatters';
	import {
		formatNumber,
		formatPercent,
		formatPrice,
		formatPriceDifference,
		formatTimeDiffMinutesSeconds
	} from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { Alert, Button, DataBadge, DataBox, HashAddress, PageHeading, Timestamp } from '$lib/components';
	import TransactionTable from './TransactionTable.svelte';

	export let data;

	const { chain, trade } = data;

	const assetUrl = trade.pricingPair.info_url;
</script>

<main class="ds-container trade-page">
	<PageHeading>
		<span slot="prefix" class="heading-prefix">
			Trade #{trade.trade_id}
			{#if trade.isTest}
				<span class="heading-badge">
					<DataBadge status="warning">Test</DataBadge>
				</span>
			{/if}
			{#if trade.trade_type === 'stop_loss'}
				<span class="heading-badge">
					<DataBadge>Stop loss</DataBadge>
				</span>
			{/if}
		</span>
		<span slot="title" class="heading-title">
			{trade.actionLabel}
			{#if trade.positionImpact}
				<span class="position-impact">
					{trade.positionImpact}
				</span>
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

	<div class="trade-info">
		<DataBox label={trade.isCreditTrade ? 'Lending reserve' : 'Trading pair'} size="md">
			<svelte:element this={assetUrl ? 'a' : 'span'} href={assetUrl}>
				{#if trade.isCreditTrade}
					{trade.pricingPair.symbol}
					on Aave v3
				{:else}
					{trade.pricingPair.symbol}
					{#if trade.pricingPair.fee}
						<span class="swap-fee">{formatPercent(trade.pricingPair.fee)}</span>
					{/if}
				{/if}
			</svelte:element>
		</DataBox>

		<DataBox label="Time" size="sm">
			<table class="datatable">
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

		{#if !trade.isCreditTrade}
			<DataBox label="Price" size="sm">
				<table class="datatable">
					<tbody>
						<tr>
							<td>Mid</td>
							<td>{formatPrice(trade.price_structure?.mid_price, 2, 5)}</td>
							<td />
						</tr>

						<tr>
							<td>Expected</td>
							<td>{formatPrice(trade.planned_price, 2, 5)}</td>
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
		{/if}

		<DataBox label="Quantity" size="sm">
			<table class="datatable">
				<tbody>
					<tr>
						<td>Expected</td>
						<td>
							{formatNumber(trade.planned_quantity, 2, 5)}
							{trade.pair.actionSymbol}
						</td>
						<td>{formatPrice(trade.plannedValue, 2, 5)}</td>
					</tr>
					<tr>
						<td>Executed</td>
						<td>
							{formatNumber(trade.executed_quantity, 2, 5)}
							{trade.pair.actionSymbol}
						</td>
						<td>{formatPrice(trade.executedValue, 2, 5)}</td>
					</tr>
				</tbody>
			</table>
		</DataBox>

		{#if !trade.isCreditTrade}
			<DataBox label="Slippage" size="sm">
				<table class="datatable">
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
		{/if}
	</div>

	<TransactionTable {chain} transactions={trade.blockchain_transactions} />
</main>

<style lang="postcss">
	.trade-page {
		.heading-prefix {
			display: flex;
			align-items: center;
			gap: 1ex;
		}

		.heading-badge {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing);

			@media (--viewport-md-down) {
				font: var(--f-ui-xs-medium);
				letter-spacing: var(--f-ui-xs-spacing);
			}
		}

		.position-impact {
			color: var(--c-text-extra-light);
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing);

			@media (--viewport-md-down) {
				font: var(--f-heading-lg-medium);
				letter-spacing: var(--f-heading-lg-spacing);
			}

			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing);
			}
		}

		.error-details a {
			font-weight: 500;

			.hash-wrapper {
				display: inline-grid;
				text-decoration: inherit;
			}
		}

		.swap-fee {
			color: var(--c-text-extra-light);
		}

		.trade-info {
			display: grid;
			gap: 1.5rem;
			grid-template-columns: 1fr 1fr;
			margin-block: 1rem 3rem;

			@media (--viewport-sm-down) {
				grid-template-columns: 1fr;
				gap: 1rem;
				margin-bottom: 2rem;
			}

			:global(:first-child) {
				grid-column: 1/-1;
			}
		}

		.datatable {
			--border-spacing: 0.625rem;

			@media (--viewport-lg-up) {
				--border-spacing: 0.75rem;
			}

			td {
				height: auto !important;
				padding: 0.625rem 0.375rem;
				font: var(--f-ui-xs-medium);
				letter-spacing: var(--f-ui-xs-spacing, normal);

				@media (--viewport-lg-up) {
					font: var(--f-ui-sm-medium);
					letter-spacing: var(--f-ui-sm-spacing, normal);
				}

				&:first-child {
					padding-left: 0.75rem;
					color: var(--c-text-extra-light);
				}

				&:last-child {
					padding-right: 0.75rem;
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
