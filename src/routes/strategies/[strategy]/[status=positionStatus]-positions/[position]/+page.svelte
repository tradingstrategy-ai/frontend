<script lang="ts">
	import { formatProfitability, formatTokenAmount } from 'trade-executor-frontend/helpers/formatters';
	import { determineProfitability } from 'trade-executor-frontend/helpers/profit';
	import { getPositionFreezeReason, isPositionInError } from 'trade-executor-frontend/state/position-helpers';
	import { formatDollar, formatDuration, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain-explorer';
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
	import type { TradingPositionInfo } from './position-data';
	import type { TradingPosition } from 'trade-executor-frontend/state/interface';
	import { positionInfoDescription } from './position-data';

	export let data;

	// TODO: Is there any way to make IDE to pick these types smartly?
	let summary = data.summary;
	let position: TradingPosition = data.position;
	let chain = data.chain;
	let positionInfo: TradingPositionInfo = data.positionInfo;

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
			<DataBox label="Pair" size="sm" tightness="tight">
				<a href={position.pair.info_url}>
					{position.pair.base.token_symbol}-{position.pair.quote.token_symbol}
				</a>
			</DataBox>

			<DataBox label="Profitability" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<UpDownIndicator
							value={positionInfo.profitability}
							formatter={formatProfitability}
							compareFn={determineProfitability}
						/>
					</p>
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
						<span slot="tooltip-trigger" style:display="inline-block">
							<PositionDataIndicator text="stop loss" />
						</span>
						<span slot="tooltip-popup">
							{positionInfoDescription.stopLossTriggered}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Time" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<Timestamp date={positionInfo.openedAt} format="iso" withTime />
						{#if !positionInfo.stillOpen}
							—
						{/if}
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.openedAt}
					</span>
				</Tooltip>

				{#if !positionInfo.stillOpen}
					<Tooltip>
						<p slot="tooltip-trigger" class="tooltip-trigger-value">
							<Timestamp date={positionInfo.closedAt} format="iso" withTime />
						</p>
						<span slot="tooltip-popup">
							{positionInfoDescription.closedAt}
						</span>
					</Tooltip>
				{/if}

				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatDuration(positionInfo.durationSeconds)}</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.durationSeconds}
					</span>
				</Tooltip>

				{#if positionInfo.stillOpen}
					<Badge text="Currently open" />
				{/if}
			</DataBox>

			<DataBox label="Price" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatPrice(positionInfo.openPrice)}</span>
						—
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.openPrice}
					</span>
				</Tooltip>

				{#if positionInfo.stillOpen}
					<Tooltip>
						<p slot="tooltip-trigger" class="tooltip-trigger-value">
							<span>{formatPrice(positionInfo.currentPrice)}</span>
						</p>
						<span slot="tooltip-popup">
							{positionInfoDescription.currentPrice}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<p slot="tooltip-trigger" class="tooltip-trigger-value">
							<span>{formatPrice(positionInfo.closePrice)}</span>
						</p>
						<span slot="tooltip-popup">
							{positionInfoDescription.closePrice}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Size" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatPrice(positionInfo.valueAtOpen)}</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.valueAtOpen}
					</span>
				</Tooltip>

				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>
							{formatTokenAmount(positionInfo.quantityAtOpen)}
							{position.pair.base.token_symbol}
						</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.quantityAtOpen}
					</span>
				</Tooltip>

				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>
							{formatPercent(positionInfo.portfolioWeightAtOpen)}
						</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.portfolioWeightAtOpen}
					</span>
				</Tooltip>
			</DataBox>

			{#if positionInfo.stopLossable}
				<DataBox label="Stop loss" size="sm" tightness="tight">
					<Tooltip>
						<p slot="tooltip-trigger" class="tooltip-trigger-value">
							<span>{formatPercent(positionInfo.stopLossPercentOpen)}</span>
						</p>
						<span slot="tooltip-popup">
							{positionInfoDescription.stopLossPercentOpen}
						</span>
					</Tooltip>

					{#if positionInfo.trailingStopLossPercent}
						<Tooltip>
							<span slot="tooltip-trigger" style:display="inline-block">
								<PositionDataIndicator
									text={`Trailing stop loss: ${formatPercent(positionInfo.trailingStopLossPercent)}`}
								/>
							</span>
							<span slot="tooltip-popup">
								{positionInfoDescription.trailingStopLossPercent}
							</span>
						</Tooltip>
					{/if}
				</DataBox>
			{/if}

			<DataBox label="Risk" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatPercent(positionInfo.portfolioRiskPercent)}</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.portfolioRiskPercent}
					</span>
				</Tooltip>
			</DataBox>

			<DataBox label="Volume" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatDollar(positionInfo.volume)}</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.volume}
					</span>
				</Tooltip>
			</DataBox>

			<DataBox label="Fees" size="sm" tightness="tight">
				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatDollar(positionInfo.tradingFees)}</span>
					</p>
					<span slot="tooltip-popup">
						{positionInfoDescription.tradingFees}
					</span>
				</Tooltip>

				<Tooltip>
					<p slot="tooltip-trigger" class="tooltip-trigger-value">
						<span>{formatPercent(positionInfo.tradingFeesPercent)}</span>
					</p>
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

	/* Give user hint the value is clickable / hoverable */
	.tooltip-trigger-value > :global(*) {
		border-bottom: 1px dotted;
	}
</style>
