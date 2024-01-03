<script lang="ts">
	import { formatProfitability, formatTokenAmount } from 'trade-executor/helpers/formatters';
	import { determineProfitability } from 'trade-executor/helpers/profit';
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
</script>

<main class="ds-container position-page">
	<PageHeading title="Position #{position.position_id}">
		<a slot="prefix" href="/strategies/{summary.id}">{summary.name}</a>
	</PageHeading>

	<section>
		{#if position.failedOpen}
			<Alert size="md" status="error" title="Failed entry">
				<p>
					The first trade opening this position failed to execute correctly. There is no correct or meaningful data
					available for this position. The position was discarded.
				</p>
			</Alert>
		{/if}

		{#if position.frozen && position.freezeReason}
			{@const { tradeId, revertReason, txHash } = position.freezeReason}
			<Alert size="md" status="error" title="This position is currently in an error state">
				<ul class="error-details">
					<li>Failure reason: <i>{revertReason}</i></li>
					<li>
						<a href={`./${position.position_id}/trade-${tradeId}`}>View failed trade #{tradeId}</a>
					</li>
					<li>
						<a href={getExplorerUrl(chain, txHash)} target="_blank" rel="noreferrer">
							View transaction
							<span class="hash-wrapper"><HashAddress address={txHash} /></span>
						</a>
					</li>
				</ul>
			</Alert>
		{/if}

		<DataBoxes>
			<DataBox label="Ticker" size="sm">
				<div>
					<a href={position.pair.info_url}>
						{position.pair.symbol}
					</a>
					{position.pair.kindShortLabel}
				</div>
			</DataBox>

			<DataBox label="Profitability" size="sm">
				<Tooltip>
					<svelte:fragment slot="trigger">
						<UpDownIndicator
							value={position.profitability}
							formatter={formatProfitability}
							compareFn={determineProfitability}
							let:formatted
						>
							<span class="underline">{formatted}</span>
						</UpDownIndicator>
					</svelte:fragment>
					<span slot="popup">
						{#if position.stillOpen}
							{position.tooltip.unrealisedProfitability}
						{:else}
							{position.tooltip.realisedProfitability}
						{/if}
					</span>
				</Tooltip>

				{#if position.stopLossTriggered}
					<Tooltip>
						<PositionDataIndicator slot="trigger" text="stop loss" />
						<span slot="popup">
							{position.tooltip.stopLossTriggered}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Time" size="sm">
				<div>
					<Tooltip>
						<span slot="trigger" class="underline">
							<Timestamp date={position.opened_at} withTime />
						</span>
						<span slot="popup">
							{position.tooltip.opened_at}
						</span>
					</Tooltip>
					{position.stillOpen ? '' : '—'}
				</div>

				{#if !position.stillOpen}
					<Tooltip>
						<span slot="trigger" class="underline">
							<Timestamp date={position.closed_at} withTime />
						</span>
						<span slot="popup">
							{position.tooltip.closed_at}
						</span>
					</Tooltip>
				{/if}

				<Tooltip>
					<span slot="trigger" class="underline">
						{formatDuration(position.durationSeconds)}
					</span>
					<span slot="popup">
						{position.tooltip.durationSeconds}
					</span>
				</Tooltip>

				{#if position.stillOpen || true}
					<Badge text="Currently open" />
				{/if}
			</DataBox>

			<DataBox label="Price" size="sm">
				<div>
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(position.openPrice)}
						</span>
						<span slot="popup">
							{position.tooltip.openPrice}
						</span>
					</Tooltip>
					—
				</div>

				{#if position.stillOpen}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(position.currentPrice)}
						</span>
						<span slot="popup">
							{position.tooltip.currentPrice}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(position.closePrice)}
						</span>
						<span slot="popup">
							{position.tooltip.closePrice}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Size" size="sm">
				<Tooltip>
					<span slot="trigger" class="underline">
						<span>{formatPrice(position.valueAtOpen)}</span>
					</span>
					<span slot="popup">
						{position.tooltip.valueAtOpen}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="trigger" class="underline">
						{formatTokenAmount(position.quantityAtOpen)}
						{position.pricingPair.base.token_symbol}
					</span>
					<span slot="popup">
						{position.tooltip.quantityAtOpen}
					</span>
				</Tooltip>

				<Tooltip>
					<span slot="trigger" class="underline">
						{formatPercent(position.portfolioWeightAtOpen)}
					</span>
					<span slot="popup">
						{position.tooltip.portfolioWeightAtOpen}
					</span>
				</Tooltip>
			</DataBox>

			{#if position.stopLossable}
				<DataBox label="Stop loss" size="sm">
					{#if position.stopLossPercentOpen === undefined}
						<Tooltip>
							<span slot="trigger" class="underline"> N/A </span>
							<span slot="popup">
								{position.tooltip.stopLossPercentOpenMissing}
							</span>
						</Tooltip>
					{:else}
						<Tooltip>
							<span slot="trigger" class="underline">
								<!--
								Stop loss is usually expressed percent of the total position, but
								internally we use the flipped definition as it makes calculations simpler
								-->
								{formatPercent(1 - position.stopLossPercentOpen)}
							</span>
							<span slot="popup">
								{position.tooltip.stopLossPercentOpen}
							</span>
						</Tooltip>
					{/if}

					{#if position.trailing_stop_loss_pct}
						<Tooltip>
							<PositionDataIndicator
								slot="trigger"
								text={`Trailing stop loss: ${formatPercent(position.trailing_stop_loss_pct)}`}
							/>
							<span slot="popup">
								{position.tooltip.trailing_stop_loss_pct}
							</span>
						</Tooltip>
					{/if}
				</DataBox>
			{/if}

			<DataBox label="Risk" size="sm">
				{#if position.portfolioRiskPercent === undefined}
					<Tooltip>
						<span slot="trigger" class="underline"> N/A </span>
						<span slot="popup">
							{position.tooltip.portfolioRiskPercentMissing}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPercent(position.portfolioRiskPercent)}
						</span>
						<span slot="popup">
							{position.tooltip.portfolioRiskPercent}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			<DataBox label="Volume" size="sm">
				<Tooltip>
					<span slot="trigger" class="underline">
						{formatDollar(position.volume)}
					</span>
					<span slot="popup">
						{position.tooltip.volume}
					</span>
				</Tooltip>
			</DataBox>

			<DataBox label="Fees" size="sm">
				{#if position.tradingFees === undefined}
					<Tooltip>
						<span slot="trigger" class="underline"> N/A </span>
						<span slot="popup">
							{position.tooltip.tradingFeesMissing}
						</span>
					</Tooltip>
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatDollar(position.tradingFees, 4)}
						</span>
						<span slot="popup">
							{position.tooltip.tradingFees}
						</span>
					</Tooltip>

					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPercent(position.tradingFeesPercent, 4)}
						</span>
						<span slot="popup">
							{position.tooltip.tradingFeesPercent}
						</span>
					</Tooltip>
				{/if}
			</DataBox>
		</DataBoxes>

		<TradeTable trades={position.trades} />
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
