<script lang="ts">
	import { formatProfitability } from 'trade-executor/helpers/formatters';
	import { determineProfitability } from 'trade-executor/helpers/profit';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import {
		Alert,
		DataBadge,
		DataBox,
		HashAddress,
		PageHeading,
		Section,
		SummaryBox,
		Tooltip,
		UpDownIndicator
	} from '$lib/components';
	import TradeTable from './TradeTable.svelte';
	import PositionSummary from './PositionSummary.svelte';

	export let data;
	const { position, chain } = data;

	const assetUrl = position.pricingPair.info_url;
</script>

<main class="position-page ds-3">
	<Section>
		<PageHeading prefix="Position #{position.position_id}">
			<div slot="title">
				{#if assetUrl}
					<a href={assetUrl}>{position.pricingPair.symbol}</a>
				{:else}
					{position.pricingPair.symbol}
				{/if}
				<span class="position-kind">
					{position.pair.kindShortLabel}
				</span>
			</div>
		</PageHeading>
	</Section>

	<Section>
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

		<div class="position-tables">
			<PositionSummary {position} />
			<SummaryBox title="Other metrics" />
		</div>

		<div class="position-info">
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
						<span slot="trigger" class="data-badge">
							<DataBadge>Stop loss</DataBadge>
						</span>
						<span slot="popup">
							{position.tooltip.stopLossTriggered}
						</span>
					</Tooltip>
				{/if}
			</DataBox>

			{#if position.isCreditPosition}
				<DataBox label="Interest rate" size="sm">
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPercent(position.interestRateAtOpen)}
						</span>
						<span slot="popup">
							{position.tooltip.interestRateAtOpen}
						</span>
					</Tooltip>
				</DataBox>
			{/if}

			<DataBox label="Size" size="sm">
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
							<span slot="trigger" class="underline">N/A</span>
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
							<span slot="trigger" class="data-badge">
								<DataBadge>
									Trailing stop loss: ${formatPercent(position.trailing_stop_loss_pct)}
								</DataBadge>
							</span>
							<span slot="popup">
								{position.tooltip.trailing_stop_loss_pct}
							</span>
						</Tooltip>
					{/if}
				</DataBox>
			{/if}

			{#if !position.isCreditPosition}
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
			{/if}

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
		</div>
	</Section>

	<Section padding="sm">
		<TradeTable
			trades={position.trades}
			isCreditPosition={position.isCreditPosition}
			interestRateAtOpen={position.interestRateAtOpen}
		/>
	</Section>
</main>

<style lang="postcss">
	.error-details a {
		font-weight: 500;

		.hash-wrapper {
			display: inline-grid;
			text-decoration: inherit;
		}
	}

	.position-tables {
		display: grid;
		grid-template-columns: 8fr 5fr;
		/* TODO: adjust gap for desktop/mobile */
		gap: 2rem;

		/* TODO: remove */
		margin-bottom: 2rem;
		min-height: 15rem;
	}

	.position-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(24rem, 100%), 1fr));
		gap: 1.5rem;

		@media (--viewport-sm-down) {
			gap: 1rem;
		}
	}

	.position-kind {
		color: var(--c-text-ultra-light);
	}

	.data-badge {
		:global([data-css-props]) {
			--data-badge-background: var(--c-box-4);
		}
		font-size: 0.6em;
		line-height: 125%;
	}

	.position-page :global .data-box {
		align-content: flex-start;

		.value {
			display: grid;
			gap: var(--space-sm);
		}
	}
</style>
