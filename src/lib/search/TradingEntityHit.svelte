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
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { Icon } from '$lib/components';

	// Any token with less than this liquidity
	// is grayed out in the search results
	const LIQUIDITY_QUALITY_THRESHOLD = 50_000;

	/**
	 * object returned by Typesense `tradingEntity` search hits; see:
	 * https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md
	 */
	export let document;
	export let layout: 'basic' | 'advanced';

	const isBasicLayout = layout === 'basic';
	const isAdvancedLayout = layout === 'advanced';
	const isLowQuality = document.liquidity < LIQUIDITY_QUALITY_THRESHOLD;
	const hasPriceChange = Number.isFinite(document.price_change_24h);
	const hasValidPrice = document.price_usd_latest > 0;
	const hasTradingData = [document.liquidity, document.volume_24h, document.price_change_24h].some(Number.isFinite);
	const typeLabel = document.type === 'exchange' ? 'DEX' : document.type;
	const title = isLowQuality ? 'Warning: low liquidity' : null;

	const priceChangeClass = determinePriceChangeClass(document.price_change_24h);
	const priceChangePct = Math.abs(document.price_change_24h).toLocaleString('en-US', {
		style: 'percent',
		minimumFractionDigits: 1
	});
</script>

<li {title}>
	<a href={document.url_path} class={layout} class:isLowQuality>
		<div class="type type-{document.type}">{typeLabel}</div>
		<div class="info">
			<div class="primary">
				<div class="desc">
					{document.description}
					{#if isAdvancedLayout && isLowQuality}
						<Icon name="warning" />
					{/if}
				</div>

				{#if isBasicLayout && !isLowQuality && hasPriceChange}
					<div class="price-change {priceChangeClass}">{priceChangePct}</div>
				{:else if isBasicLayout && isLowQuality}
					<Icon name="warning" size="22px" />
				{:else if isAdvancedLayout && hasValidPrice}
					<div class="price {priceChangeClass}">{formatDollar(document.price_usd_latest)}</div>
				{/if}
			</div>

			{#if isAdvancedLayout && hasTradingData}
				<div class="secondary">
					<div class="measures">
						<div class="volume">
							<dt>Volume 24h</dt>
							<dd>{formatDollar(document.volume_24h, 1, 1)}</dd>
						</div>
						<div class="liquidity">
							<dt>Liquidity</dt>
							<dd>{formatDollar(document.liquidity, 1, 1)}</dd>
						</div>
					</div>
					<div class="price-change {priceChangeClass}">
						{hasPriceChange ? formatPriceChange(document.price_change_24h) : ''}
					</div>
				</div>
			{/if}
		</div>
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
		background-color: var(--c-gray-extra-dark);
	}

	li {
		display: grid;
		list-style-type: none;
	}

	a {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1em;
		align-items: center;
		border: 2px solid;
		border-color: var(--cm-light, var(--c-gray)) var(--cm-dark, var(--c-parchment-extra-dark));
		border-radius: 0.625rem;
		outline: none;

		&.basic {
			padding: 0.875rem 0.75rem;
		}

		&.advanced {
			padding: 0.625rem 0.75rem;

			@media (--viewport-md-up) {
				gap: 1.5rem;
				padding: 0.75rem 1.25rem;
				border-width: 1px;
				border-color: var(--c-border-2);
			}
		}

		&.isLowQuality {
			opacity: 0.35;
			&:hover {
				background: var(--c-background-2);
			}
		}

		&:hover {
			background: var(--c-background-4);
		}

		&:focus {
			background: var(--c-background-4);
			border-color: var(--c-border-2);
		}
	}

	.type {
		display: grid;
		align-content: center;
		border-radius: 0.375rem;
		padding-block: 0.25rem;
		width: 3.5rem;
		font: 500 var(--fs-ui-sm);
		color: var(--c-parchment);
		text-transform: capitalize;
		text-align: center;

		@media (--viewport-md-up) {
			@nest .advanced & {
				width: 5rem;
				font: 500 var(--fs-ui-md);
				letter-spacing: 0.01em;
			}
		}
	}

	.info {
		display: grid;
		gap: 0.25rem;
	}

	.primary,
	.secondary {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		overflow: hidden;
	}

	.primary {
		gap: 0.5rem;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;

		@media (--viewport-md-up) {
			@nest .advanced & {
				font: 600 var(--fs-heading-sm);
				letter-spacing: 0;
			}
		}

		& .desc {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;

			& :global svg {
				margin: -0.25em 0 0 0.25em;
			}
		}

		& .price-change,
		& .price {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			max-width: 50%;
			overflow-wrap: break-word;
			text-align: right;
		}

		& .price-change {
			font-weight: 700;
		}

		@media (--viewport-sm-down) {
			& .price {
				font-weight: 700;
			}
		}
	}

	.secondary {
		gap: 0.625em;
		font: 400 var(--fs-ui-md);

		@media (--viewport-sm-down) {
			font: 400 var(--fs-ui-sm);
		}

		@media (--viewport-xs) {
			font: 400 var(--fs-ui-xs);
		}

		& .measures {
			display: flex;
			gap: inherit;
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

		& .price-change {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			flex: 1;
			min-width: 5em;
			max-width: 50%;
			overflow-wrap: break-word;
			text-align: right;
		}
	}
</style>
