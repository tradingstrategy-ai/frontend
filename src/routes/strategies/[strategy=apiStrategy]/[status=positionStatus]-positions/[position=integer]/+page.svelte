<!--
Individual strategy position page.
-->
<script lang="ts">
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { Alert, Button, HashAddress, PageHeading, Section } from '$lib/components';
	import {
		getExchangeAccountInfo,
		getExchangeAccountUrl,
		getExchangeDisplayName
	} from 'trade-executor/helpers/exchange-account';
	import TradeTable from './TradeTable.svelte';
	import PositionProfitability from './PositionProfitability.svelte';
	import PositionSummary from './PositionSummary.svelte';
	import OtherMetrics from './OtherMetrics.svelte';
	import PositionCharts from './PositionCharts.svelte';
	import PositionVaultAbout from './PositionVaultAbout.svelte';
	import { resolve } from '$app/paths';

	export let data;
	const { position, positionVault, chain, strategy, status } = data;

	const isVaultPosition = position.pair.isVault;
	const assetUrl = isVaultPosition
		? position.pair.pool_address
			? resolve(`/vaults/address/${position.pair.pool_address}`)
			: undefined
		: position.pricingPair.info_url;
	const hyperliquidVaultUrl =
		isVaultPosition && strategy.on_chain_data.chain_id === 9999
			? `https://app.hyperliquid.xyz/vaults/${position.pair.pool_address}`
			: undefined;
	const isExchangeAccountPosition = position.pair.kind === 'exchange_account';
	const exchangeProtocol = position.pair.other_data?.exchange_protocol;
	const exchangeAccount = getExchangeAccountInfo(strategy);
	// Fall back to position-level protocol detection when tags are missing
	const exchangeUrl = isExchangeAccountPosition
		? (exchangeAccount?.url ??
			(exchangeProtocol && strategy.on_chain_data.asset_management_mode === 'lagoon'
				? getExchangeAccountUrl(exchangeProtocol, strategy.on_chain_data.smart_contracts.safe)
				: undefined))
		: undefined;
	const exchangeName = isExchangeAccountPosition
		? (exchangeAccount?.name ?? (exchangeProtocol ? getExchangeDisplayName(exchangeProtocol) : undefined))
		: undefined;
	const tradePathBase = `./${position.position_id}`;
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
				<div class="cta-buttons">
					{#if assetUrl}
						<Button size="sm" target="_blank" rel="noreferrer" href={assetUrl}>
							{isVaultPosition
								? 'View vault on Trading Strategy'
								: position.isCreditPosition
									? 'View lending reserve'
									: 'View trading pair'}
						</Button>
					{/if}
					{#if hyperliquidVaultUrl}
						<Button size="sm" target="_blank" rel="noreferrer" href={hyperliquidVaultUrl}>
							View vault on Hyperliquid
						</Button>
					{/if}
				</div>
			</svelte:fragment>
		</PageHeading>

		{#if position.isDustPositionWarning}
			<div class="dust-position-warning">
				<Alert size="sm" status="warning">The metrics might be off because the position is too small (dusty).</Alert>
			</div>
		{/if}
	</Section>

	{#if positionVault}
		<Section>
			<PositionVaultAbout vault={positionVault} />
		</Section>
	{/if}

	<Section class={position.failedOpen || position.frozen ? 'has-error' : ''}>
		{#if position.failedOpen}
			<Alert size="sm" status="error" title="Failed entry">
				<p>
					The first trade opening this position failed to execute correctly. There is no correct or meaningful data
					available for this position. The position was discarded.
				</p>
			</Alert>
		{/if}

		{#if position.frozen && position.freezeReason}
			{@const { tradeId, revertReason, txHash } = position.freezeReason}
			<Alert size="sm" status="error" title="This position is currently in an error state">
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

	<Section class="position-info-section">
		<div class="position-info">
			<PositionProfitability {position} {exchangeUrl} {exchangeName} />
			<PositionSummary {position} />
			{#if !isExchangeAccountPosition}
				<div class="position-side-info">
					<OtherMetrics {position} />
				</div>
			{/if}
		</div>
	</Section>

	{#if status !== 'frozen'}
		<Section padding="sm">
			<PositionCharts executorUrl={strategy.url} positionId={position.position_id} {tradePathBase} />
		</Section>
	{/if}

	{#if !isExchangeAccountPosition}
		<Section padding="sm">
			<TradeTable
				trades={position.trades}
				isCreditPosition={position.isCreditPosition}
				interestRateAtOpen={position.interestRateAtOpen}
			/>
		</Section>
	{/if}
</main>

<style>
	.position-page {
		:global(.position-info-section) {
			margin-top: var(--space-3xl);

			@media (--viewport-md-down) {
				margin-top: var(--space-lg);
			}

			@media (--viewport-sm-down) {
				margin-top: var(--space-ml);
			}
		}

		:global(.has-error) {
			margin-bottom: 1.5rem;
		}

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

				/* position side info in 2nd column, spanning 2 rows */
				.position-side-info {
					grid-column: 2;
					grid-row: 1 / span 2;
				}
			}

			.position-side-info {
				display: grid;
				gap: 1.5rem;
				align-content: start;
			}
		}

		.position-kind {
			color: var(--c-text-ultra-light);
		}

		.cta-buttons {
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem;
			justify-content: flex-end;
		}

		.dust-position-warning {
			margin-top: var(--space-lg);
		}
	}
</style>
