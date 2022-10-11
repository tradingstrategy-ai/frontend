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

	const priceChangeClass = determinePriceChangeClass(document.price_change_24h);
	const priceChangePct = Math.abs(document.price_change_24h).toLocaleString('en-US', {
		style: 'percent',
		minimumFractionDigits: 1
	});
</script>

<li>
	<a href={document.url_path} class={layout} class:isLowQuality>
		<div class="type type-{document.type}">{document.type}</div>
		<div class="info">
			<div class="primary">
				<div class="desc">{document.description}</div>

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
					<div class="volume">
						<dt>Volume 24h</dt>
						<dd>{formatDollar(document.volume_24h, 1, 1)}</dd>
					</div>
					<div class="liquidity">
						<dt>Liquidity</dt>
						<dd>
							{formatDollar(document.liquidity, 1, 1)}
							{#if isLowQuality}
								<Icon name="warning" />
							{/if}
						</dd>
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
				gap: 1.75rem;
				padding: 1.125rem 1.375rem;
				border-color: var(--c-border-2);
			}
		}

		&.isLowQuality {
			opacity: 0.5;
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
		padding: 0.25rem 0.625rem;
		font: 500 var(--fs-ui-sm);
		color: var(--c-parchment);
		text-transform: capitalize;
		text-align: center;

		@media (--viewport-md-up) {
			@nest .advanced & {
				padding: 0.5rem 1.25rem;
				font: 500 var(--fs-ui-lg);
			}
		}
	}

	.info {
		display: grid;
		gap: 0.25rem;
	}

	.primary {
		display: grid;
		grid-template-columns: 1fr auto;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;

		@media (--viewport-md-up) {
			@nest .advanced & {
				font: 600 var(--fs-heading-md);
				letter-spacing: 0;
			}
		}

		& .desc {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
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
		display: flex;
		flex-direction: row;
		gap: 0.625em;
		font: 400 var(--fs-ui-md);

		@media (--viewport-sm-down) {
			font: 400 var(--fs-ui-sm);
		}

		@media (width < 576px) {
			font: 400 var(--fs-ui-xs);
		}

		& dt {
			display: inline-block;
			font-weight: 400;
		}

		& dd {
			display: inline-block;
			margin: 0;
			font-weight: 700;
		}

		& .price-change {
			text-align: right;
			flex: 1;
		}

		& :global svg {
			margin-top: -3px;
		}
	}
</style>
