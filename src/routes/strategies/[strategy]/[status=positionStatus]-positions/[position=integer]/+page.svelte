<script lang="ts">
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { Alert, Button, HashAddress, PageHeading, Section } from '$lib/components';
	import TradeTable from './TradeTable.svelte';
	import PositionProfitability from './PositionProfitability.svelte';
	import PositionSummary from './PositionSummary.svelte';
	import OtherMetrics from './OtherMetrics.svelte';

	export let data;
	const { position, chain } = data;

	const assetUrl = position.pricingPair.info_url;
</script>

<main class="position-page ds-3">
	<Section>
		<PageHeading prefix="Position #{position.position_id}">
			<div slot="title">
				{position.pricingPair.symbol}
				<span class="position-kind">
					{position.pair.kindShortLabel}
				</span>
			</div>
			<svelte:fragment slot="cta">
				{#if assetUrl}
					<Button size="sm" target="_blank" href={assetUrl}>
						{position.isCreditPosition ? 'View lending reserve' : 'View trading pair'}
					</Button>
				{/if}
			</svelte:fragment>
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
	</Section>

	<Section>
		<div class="position-info">
			<PositionProfitability {position} />
			<PositionSummary {position} />
			<OtherMetrics {position} />
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

	.position-info {
		display: grid;
		gap: 2rem;
		align-items: flex-start;

		@media (--viewport-lg-up) {
			/* use 2-column layout on desktop */
			grid-template-columns: 2fr 1fr;
			grid-template-rows: auto 1fr;
			row-gap: 1.5rem;

			/* position OtherMetrics in 2nd column, spanning 2 rows */
			> :global(:last-child) {
				grid-column: 2;
				grid-row: 1 / span 2;
			}
		}
	}

	.position-kind {
		color: var(--c-text-ultra-light);
	}
</style>
