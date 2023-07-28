<script lang="ts">
	import { formatProfitability, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitability } from 'trade-executor-frontend/helpers/profit';
	import { getPositionFreezeReason, isPositionInError } from 'trade-executor-frontend/state/position-helpers';
	import { formatDollar, formatDuration, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain-explorer';
	import { extractPositionInfo, positionInfoDescription } from './position-data';
	import {
		Alert,
		Badge,
		DataBox,
		DataBoxes,
		HashAddress,
		PageHeading,
		Timestamp,
		Tooltip,
		UpDownIndicator
	} from '$lib/components';
	import TradeTable from './TradeTable.svelte';
	import PositionDataIndicator from './PositionDataIndicator.svelte';

	export let data;
	const { summary, position, chain } = data;

	const positionInfo = extractPositionInfo(position);
	const positionFailed = isPositionInError(position);
	const positionErrorInfo = positionFailed && getPositionFreezeReason(position);
	const trades = Object.values(position.trades);
</script>

<main class="ds-container position-page">
	<PageHeading level={2}>
		<h1><a href="/strategies/{summary.id}">{summary.name}</a></h1>
		<h2>Position #{position.position_id}</h2>
	</PageHeading>

	<section>
		{#if positionInfo.failedOpen}
			<Alert size="md" status="error" title="Failed entry">
				<p>
					The first trade opening this position failed to execute correctly. There is no correct or meaningful data
					available for this position. The position was discarded.
				</p>
			</Alert>
		{/if}

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
			<DataBox label="Pair" size="sm">
				<a href={position.pair.info_url}>
					{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
				</a>
			</DataBox>

			<DataBox label="Profitability" size="sm">
				<Tooltip>
					<span slot="tooltip-trigger">
						<UpDownIndicator
							value={positionInfo.profitability}
							formatter={formatProfitability}
							compareFn={determineProfitability}
						/>
					</span>
					<span slot="tooltip-popup">
						{#if positionInfo.stillOpen}
							{positionInfoDescription.unrealisedProfitability}
						{:else}
							{positionInfoDescription.realisedProfitability}
						{/if}
					</span>
				</Tooltip>

				{#if positionInfo.stopLossTriggered}
					<Tooltip>
						<PositionDataIndicator slot="tooltip-trigger" text="stop loss" />
						<span slot="tooltip-popup">
							{positionInfoDescription.stopLossTriggered}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Time" size="sm">
				<div>
					<Tooltip>
						<span slot="tooltip-trigger">
							<Timestamp date={positionInfo.openedAt} format="iso" withTime />
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.openedAt}
						</span>
					</Tooltip>
					{positionInfo.stillOpen ? '' : '—'}
				</div>

				{#if !positionInfo.stillOpen}
					<Tooltip>
						<span slot="tooltip-trigger">
							<Timestamp date={positionInfo.closedAt} format="iso" withTime />
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.closedAt}
						</span>
					</Tooltip>
				{/if}

				<Tooltip>
					<span slot="tooltip-trigger">
						{formatDuration(positionInfo.durationSeconds)}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.durationSeconds}
					</span>
				</Tooltip>

				{#if positionInfo.stillOpen}
					<Badge text="Currently open" />
				{/if}
			</DataBox>

			<DataBox label="Price" size="sm">
				<div>
					<Tooltip>
						<span slot="tooltip-trigger">
							{formatPrice(positionInfo.openPrice)}
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.openPrice}
						</span>
					</Tooltip>
					—
				</div>

				{#if positionInfo.stillOpen}
					<Tooltip>
						<span slot="tooltip-trigger">
							{formatPrice(positionInfo.currentPrice)}
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.currentPrice}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="tooltip-trigger">
							{formatPrice(positionInfo.closePrice)}
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.closePrice}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Size" size="sm">
				<Tooltip>
					<span slot="tooltip-trigger">
						<span>{formatPrice(positionInfo.valueAtOpen)}</span>
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.valueAtOpen}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="tooltip-trigger">
						{formatTokenAmount(positionInfo.quantityAtOpen)}
						{position.pair.base.token_symbol}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.quantityAtOpen}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="tooltip-trigger">
						{formatPercent(positionInfo.portfolioWeightAtOpen)}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.portfolioWeightAtOpen}
					</span>
				</Tooltip>
			</DataBox>

			{#if positionInfo.stopLossable}
				<DataBox label="Stop loss" size="sm">
					<Tooltip>
						<span slot="tooltip-trigger">
							{formatPercent(positionInfo.stopLossPercentOpen)}
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.stopLossPercentOpen}
						</span>
					</Tooltip>

					{#if positionInfo.trailingStopLossPercent}
						<Tooltip>
							<PositionDataIndicator
								slot="tooltip-trigger"
								text={`Trailing stop loss: ${formatPercent(positionInfo.trailingStopLossPercent)}`}
							/>
							<span slot="tooltip-popup">
								{positionInfoDescription.trailingStopLossPercent}
							</span>
						</Tooltip>
					{/if}
				</DataBox>
			{/if}

			<DataBox label="Risk" size="sm">
				<Tooltip>
					<span slot="tooltip-trigger">
						{formatPercent(positionInfo.portfolioRiskPercent)}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.portfolioRiskPercent}
					</span>
				</Tooltip>
			</DataBox>

			<DataBox label="Volume" size="sm">
				<Tooltip>
					<span slot="tooltip-trigger">
						{formatDollar(positionInfo.volume)}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.volume}
					</span>
				</Tooltip>
			</DataBox>

			<DataBox label="Fees" size="sm">
				<Tooltip>
					<span slot="tooltip-trigger">
						{formatDollar(positionInfo.tradingFees)}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.tradingFees}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="tooltip-trigger">
						{formatPercent(positionInfo.tradingFeesPercent)}
					</span>
					<span slot="tooltip-popup">
						{positionInfoDescription.tradingFeesPercent}
					</span>
				</Tooltip>
			</DataBox>
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

	.error-details a {
		font-weight: 500;

		& .hash-wrapper {
			display: inline-grid;
		}
	}

	.position-page :global .data-box {
		align-content: flex-start;

		& .value {
			display: grid;
			gap: var(--space-sm);
			justify-items: flex-start;
		}

		/* Give user hint the value is clickable / hoverable */
		& [slot='tooltip-trigger'] {
			border-bottom: 1px dotted;
		}
	}
</style>
