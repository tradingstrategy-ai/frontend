<!--
@component
Used for displaying search results; displays a single `$tradingEntity` result
line item; supports basic (top-nav) and advanced (/search page) layouts.

#### Usage:
```tsx
  <TradingEntityHit {document} layout="basic|advanced" />
```
-->
<script lang="ts">
	import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
	import {
		formatDollar,
		formatSwapFee,
		formatPercent,
		formatPriceChange,
		formatInterestRate
	} from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { Icon, UpDownCell } from '$lib/components';

	// Any token with less than this liquidity is grayed out in the search results
	const LIQUIDITY_QUALITY_THRESHOLD = 50_000;

	// object returned by Typesense `tradingEntity` search hits; see:
	// https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md
	export let document: DocumentSchema;
	export let layout: 'basic' | 'advanced';

	const isBasicLayout = layout === 'basic';
	const isAdvancedLayout = layout === 'advanced';
	const hasPriceChange = Number.isFinite(document.price_change_24h);
	const hasValidPrice = document.price_usd_latest > 0;
	const hasTradingData = [document.liquidity, document.volume_24h, document.price_change_24h].some(Number.isFinite);
	const isLendingReserve = document.type === 'lending_reserve';

	// flag low quality results
	const hasLiquidityFactor = document.quality_factors?.includes('liquidity');
	const hasLowLiquidity = hasLiquidityFactor && document.liquidity < LIQUIDITY_QUALITY_THRESHOLD;
	const isIncompatibleExchange = document.exchange_type === 'uniswap_v2_incompatible';
	const isLowQuality = hasLowLiquidity || isIncompatibleExchange;

	const labels: Record<string, string> = {
		exchange: 'DEX',
		lending_reserve: 'Reserve'
	};
	const typeLabel = labels[document.type] ?? document.type;

	function getTitle() {
		if (isIncompatibleExchange) return 'Warning: incompatible exchange';
		if (hasLowLiquidity) return 'Warning: low liquidity';
	}
</script>

<li title={getTitle()}>
	<a class="trading-entity-hit tile b {layout}" class:isLowQuality href={document.url_path}>
		<div class="type type-{document.type}">
			{typeLabel}
			<div class="chain-icon">
				<img src={getLogoUrl('chain', document.blockchain)} alt={document.blockchain} />
			</div>
		</div>
		<div class="info">
			<div class="primary">
				<div class="desc truncate lines-2">
					{document.description}
					{#if document.pool_swap_fee}
						<span class="pool-swap-fee">({formatSwapFee(document.pool_swap_fee)})</span>
					{/if}
					{#if isAdvancedLayout && isLowQuality}
						<Icon name="warning" />
					{/if}
				</div>
			</div>

			{#if isAdvancedLayout && (hasTradingData || isLendingReserve)}
				<div class="secondary">
					<div class="measures">
						{#if hasTradingData}
							<div>
								<dt>Volume 24h</dt>
								<dd>{formatDollar(document.volume_24h, 1, 1)}</dd>
							</div>
							<div>
								<dt>Liquidity</dt>
								<dd>{formatDollar(document.liquidity, 1, 1)}</dd>
							</div>
						{:else if isLendingReserve}
							{@const variableBorrowApr = document.variable_borrow_apr}
							<div>
								<dt>Supply APR</dt>
								<dd>{formatInterestRate(document.supply_apr)}</dd>
							</div>
							<div>
								<dt>Variable Borrow APR</dt>
								<dd>{variableBorrowApr > 0 ? formatInterestRate(variableBorrowApr) : 'N/A'}</dd>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Basic layout - warning indicator OR price change % -->
		{#if isBasicLayout && isLowQuality}
			<Icon name="warning" size="20px" />
		{:else if isBasicLayout && hasPriceChange}
			<UpDownCell value={document.price_change_24h} formatter={(val) => formatPercent(Math.abs(val))} />
		{/if}

		<!-- Advanced layout - current price & price change % -->
		{#if isAdvancedLayout && (hasPriceChange || hasValidPrice)}
			<UpDownCell value={document.price_change_24h}>
				{#if hasValidPrice}
					<span class="truncate">{formatDollar(document.price_usd_latest)}</span>
				{/if}
				{#if hasPriceChange}
					<span class="truncate">{formatPriceChange(document.price_change_24h)}</span>
				{/if}
			</UpDownCell>
		{/if}
	</a>
</li>

<style lang="postcss">
	.type-exchange {
		background-color: var(--c-wood);
	}

	.type-token {
		background-color: var(--c-parchment-super-dark);
	}

	.type-pair {
		background-color: var(--c-gray-dark);
	}

	.type-lending_reserve {
		background-color: #7a5c7f;
	}

	li {
		display: grid;
		list-style-type: none;
	}

	.trading-entity-hit {
		display: grid;
		gap: var(--space-md);
		grid-template-columns: auto 1fr auto;
		place-content: center stretch;
		place-items: center stretch;
		border-radius: var(--radius-md);
		outline: none;
		transition: all var(--time-sm) ease-out;

		&.basic {
			padding: var(--space-ms) var(--space-sl);
			border: none;

			@media (--viewport-sm-up) {
				padding-block: var(--space-md);
			}
		}

		&.advanced {
			padding: var(--space-sm) var(--space-sl);

			@media (--viewport-md-up) {
				gap: var(--space-lg);
				padding: var(--space-sl) var(--space-ml);
				border-width: 1px;
				border-color: var(--c-border-2-v1);
			}
		}

		&.isLowQuality {
			opacity: 0.35;
			&:hover {
				background: var(--c-background-2-v1);
			}
		}

		&:hover {
			& :global .up-down-indicator {
				&.bearish {
					background: hsla(var(--hsl-bearish), 0.24) !important;
				}

				&.bullish {
					background: hsla(var(--hsl-bullish), 0.24) !important;
				}
			}
		}

		&:focus {
			background: var(--c-background-4-v1);
			border-color: var(--c-border-2-v1);
		}
	}

	.type {
		position: relative;
		display: grid;
		align-content: center;
		border-radius: var(--radius-xxs);
		padding-block: var(--space-xs);
		width: 5rem;
		font: var(--f-ui-xs-medium);
		letter-spacing: var(--f-ui-xs-spacing, normal);
		color: var(--c-parchment);
		text-transform: capitalize;
		text-align: center;

		@media (--viewport-md-up) {
			@nest .advanced & {
				width: 5.25rem;
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}

		& .chain-icon {
			position: absolute;
			right: 0;
			bottom: 0;
			display: grid;
			width: 1.35rem;
			padding: 2px;
			border-radius: 1rem;
			transform: translate(50%, 50%);
			background: hsla(var(--hsl-text-inverted));
			box-shadow: 0 0 1px 1px var(--c-shadow-1-v1);

			@media (--viewport-md-up) {
				@nest .advanced & {
					width: 1.5rem;
					padding: 3px;
				}
			}
		}
	}

	:global .up-down-indicator {
		max-width: min(30vw, 12rem);
	}

	.info {
		display: grid;
		gap: var(--space-xxs);
		width: 100%;
	}

	.primary,
	.secondary {
		display: grid;
		gap: inherit;
		width: 100%;
	}

	.primary {
		gap: var(--space-ss);
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		--reduced-font-weight: 400;

		@media (--viewport-md-up) {
			@nest .advanced & {
				font: var(--f-ui-lg-medium);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}

		& .desc {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;

			& :global svg {
				margin: calc(-1 * var(--space-xxs)) 0 0 var(--space-xxs);
			}
		}

		& .pool-swap-fee {
			font-weight: var(--reduced-font-weight);
			opacity: 0.7;
		}
	}

	.secondary {
		gap: 0.625em;
		font: var(--f-ui-sm-roman);
		letter-spacing: var(--f-ui-sm-spacing, normal);

		@media (--viewport-xs) {
			font: var(--f-ui-xs-roman);
			letter-spacing: var(--f-ui-xs-spacing, normal);
		}

		& .measures {
			display: flex;
			flex-wrap: wrap;
			gap: var(--space-xs);
			width: 100%;
		}

		& dt {
			display: inline-block;
			font-weight: 400;
			white-space: nowrap;
		}

		& dd {
			display: inline-block;
			margin: 0;
			font-weight: 700;
		}
	}
</style>
