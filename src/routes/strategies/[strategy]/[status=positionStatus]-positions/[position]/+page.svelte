<script lang="ts">
	import { formatProfitability, formatTokenAmount } from 'trade-executor/helpers/formatters';
	import { determineProfitability } from 'trade-executor/helpers/profit';
	import { getPositionFreezeReason, isPositionInError } from 'trade-executor/state/position-helpers';
	import { TradingPositionInfo } from 'trade-executor/state/position-info';
	import { formatDollar, formatDuration, formatPercent, formatPrice } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';
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

	const positionInfo = new TradingPositionInfo(position);
	const positionFailed = isPositionInError(position);
	const positionErrorInfo = positionFailed && getPositionFreezeReason(position);
</script>

<main class="ds-container position-page">
	<PageHeading title="Position #{position.position_id}">
		<a slot="prefix" href="/strategies/{summary.id}">{summary.name}</a>
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
					<svelte:fragment slot="trigger">
						<UpDownIndicator
							value={positionInfo.profitability}
							formatter={formatProfitability}
							compareFn={determineProfitability}
							let:formatted
						>
							<span class="underline">{formatted}</span>
						</UpDownIndicator>
					</svelte:fragment>
					<span slot="popup">
						{#if positionInfo.stillOpen}
							{positionInfo.tooltip('unrealisedProfitability')}
						{:else}
							{positionInfo.tooltip('realisedProfitability')}
						{/if}
					</span>
				</Tooltip>

				{#if positionInfo.stopLossTriggered}
					<Tooltip>
						<PositionDataIndicator slot="trigger" text="stop loss" />
						<span slot="popup">
							{positionInfo.tooltip('stopLossTriggered')}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Time" size="sm">
				<div>
					<Tooltip>
						<span slot="trigger" class="underline">
							<Timestamp date={positionInfo.openedAt} withTime />
						</span>
						<span slot="popup">
							{positionInfo.tooltip('openedAt')}
						</span>
					</Tooltip>
					{positionInfo.stillOpen ? '' : '—'}
				</div>

				{#if !positionInfo.stillOpen}
					<Tooltip>
						<span slot="trigger" class="underline">
							<Timestamp date={positionInfo.closedAt} withTime />
						</span>
						<span slot="popup">
							{positionInfo.tooltip('closedAt')}
						</span>
					</Tooltip>
				{/if}

				<Tooltip>
					<span slot="trigger" class="underline">
						{formatDuration(positionInfo.durationSeconds)}
					</span>
					<span slot="popup">
						{positionInfo.tooltip('durationSeconds')}
					</span>
				</Tooltip>

				{#if positionInfo.stillOpen}
					<Badge text="Currently open" />
				{/if}
			</DataBox>

			<DataBox label="Price" size="sm">
				<div>
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(positionInfo.openPrice)}
						</span>
						<span slot="popup">
							{positionInfo.tooltip('openPrice')}
						</span>
					</Tooltip>
					—
				</div>

				{#if positionInfo.stillOpen}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(positionInfo.currentPrice)}
						</span>
						<span slot="popup">
							{positionInfo.tooltip('currentPrice')}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(positionInfo.closePrice)}
						</span>
						<span slot="popup">
							{positionInfo.tooltip('closePrice')}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Size" size="sm">
				<Tooltip>
					<span slot="trigger" class="underline">
						<span>{formatPrice(positionInfo.valueAtOpen)}</span>
					</span>
					<span slot="popup">
						{positionInfo.tooltip('valueAtOpen')}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="trigger" class="underline">
						{formatTokenAmount(positionInfo.quantityAtOpen)}
						{position.pair.base.token_symbol}
					</span>
					<span slot="popup">
						{positionInfo.tooltip('quantityAtOpen')}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="trigger" class="underline">
						{formatPercent(positionInfo.portfolioWeightAtOpen)}
					</span>
					<span slot="popup">
						{positionInfo.tooltip('portfolioWeightAtOpen')}
					</span>
				</Tooltip>
			</DataBox>

			{#if positionInfo.stopLossable}
				<DataBox label="Stop loss" size="sm">
					{#if positionInfo.stopLossPercentOpen === undefined}
						<Tooltip>
							<span slot="trigger" class="underline"> N/A </span>
							<span slot="popup">
								{positionInfo.tooltip('stopLossPercentOpenMissing')}
							</span>
						</Tooltip>
					{:else}
						<Tooltip>
							<span slot="trigger" class="underline">
								<!--
								Stop loss is usually expressed percent of the total position, but
								internally we use the flipped definition as it makes calculations simpler
								-->
								{formatPercent(1 - positionInfo.stopLossPercentOpen)}
							</span>
							<span slot="popup">
								{positionInfo.tooltip('stopLossPercentOpen')}
							</span>
						</Tooltip>
					{/if}

					{#if positionInfo.trailingStopLossPercent}
						<Tooltip>
							<PositionDataIndicator
								slot="trigger"
								text={`Trailing stop loss: ${formatPercent(positionInfo.trailingStopLossPercent)}`}
							/>
							<span slot="popup">
								{positionInfo.tooltip('trailingStopLossPercent')}
							</span>
						</Tooltip>
					{/if}
				</DataBox>
			{/if}

			<DataBox label="Risk" size="sm">
				{#if positionInfo.portfolioRiskPercent === undefined}
					<Tooltip>
						<span slot="trigger" class="underline"> N/A </span>
						<span slot="popup">
							{positionInfo.tooltip('portfolioRiskPercentMissing')}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPercent(positionInfo.portfolioRiskPercent)}
						</span>
						<span slot="popup">
							{positionInfo.tooltip('portfolioRiskPercent')}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Volume" size="sm">
				<Tooltip>
					<span slot="trigger" class="underline">
						{formatDollar(positionInfo.volume)}
					</span>
					<span slot="popup">
						{positionInfo.tooltip('volume')}
					</span>
				</Tooltip>
			</DataBox>

			<DataBox label="Fees" size="sm">
				{#if positionInfo.tradingFees === undefined}
					<Tooltip>
						<span slot="trigger" class="underline"> N/A </span>
						<span slot="popup">
							{positionInfo.tooltip('tradingFeesMissing')}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatDollar(positionInfo.tradingFees, 4)}
						</span>
						<span slot="popup">
							{positionInfo.tooltip('tradingFees')}
						</span>
					</Tooltip>

					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPercent(positionInfo.tradingFeesPercent, 4)}
						</span>
						<span slot="popup">
							{positionInfo.tooltip('tradingFeesPercent')}
						</span>
					</Tooltip>
				{/if}
			</DataBox>
		</DataBoxes>

		<TradeTable trades={positionInfo.trades} />
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

		.hash-wrapper {
			display: inline-grid;
			text-decoration: inherit;
		}
	}

	.position-page :global .data-box {
		align-content: flex-start;

		.value {
			display: grid;
			gap: var(--space-sm);
		}
	}
</style>
