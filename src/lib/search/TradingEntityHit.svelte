<!--
@component
Used for displaying search results; displays a single `$tradingEntity` result
line item; supports basic (top-nav) and advanced (/search page) layouts.

#### Usage:
```tsx
  <TradingEntityHit
    {document}
    layout="basic|advanced"
    selected={true}
    on:mouseenter={handleMouseEnter}
  />
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
	export let selected = false;

	const label = document.type === 'exchange' ? 'DEX' : document.type;

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

<li class={layout} class:selected class:isLowQuality on:mouseenter>
	<a href={document.url_path} on:mousedown|preventDefault>
		<div class="type badge-{document.type}">{label}</div>
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
				<div class="secondary d-flex flex-grow-1">
					<div class="volume">
						<dt>volume 24h:</dt>
						<dd>{formatDollar(document.volume_24h)}</dd>
					</div>
					<div class="liquidity">
						<dt>liquidity:</dt>
						<dd>
							{formatDollar(document.liquidity)}
							{#if isLowQuality}
								<Icon name="warning" />
							{/if}
						</dd>
					</div>
					<div class="price-change">
						<dd class={priceChangeClass}>
							{hasPriceChange ? formatPriceChange(document.price_change_24h) : ''}
						</dd>
					</div>
				</div>
			{/if}
		</div>
	</a>
</li>

<style>
	li {
		display: grid;
		list-style-type: none;
	}

	.basic {
		height: 3.75rem;
		padding-inline: 0.625rem;
	}

	.advanced {
		gap: 1rem;
		border: solid var(--c-border-2);
		border-width: 1px 0 0 0;
	}

	.advanced:last-child {
		border-bottom-width: 1px;
	}

	a {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1em;
		align-items: center;
	}

	.advanced a {
		padding: 0.75rem 0;
	}

	.selected {
		background: var(--c-background-4);
	}

	.type {
		display: grid;
		align-content: center;
		border-radius: 0.375rem;
		height: 1.75rem;
		width: 3.5rem;
		font: 500 var(--fs-ui-sm);
		letter-spacing: 0.02em;
		text-transform: capitalize;
		text-align: center;
		color: var(--c-parchment);
	}

	.info {
		display: grid;
	}

	.primary {
		display: grid;
		align-items: center;
		grid-template-columns: 1fr auto;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;
	}

	.desc {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.price-change,
	.price {
		text-align: right;
		white-space: pre;
		font-weight: 700;
	}

	.basic .price-change::after {
		display: inline-block;
		width: 1em;
	}

	.basic .price-change-black::after {
		content: '-';
	}

	.basic .price-change-green::after {
		content: '▲';
	}

	.basic .price-change-red::after {
		content: '▼';
	}

	.secondary {
		justify-content: space-between;
		font: var(--f-ui-xsmall-roman);
	}

	.secondary dt {
		display: inline;
		font-weight: 400;
	}

	.secondary dd {
		display: inline;
		font-weight: 700;
	}

	.isLowQuality a {
		opacity: 0.5;
	}

	.advanced.isLowQuality div.liquidity {
		position: relative;
	}

	/* Entity badge colors */
	.badge-exchange {
		background-color: var(--c-bullish-dark);
	}

	.badge-token {
		background-color: #b99537;
	}

	.badge-pair {
		background-color: #496abf;
	}

	@media (--viewport-md-up) {
		.advanced {
			border-width: 1px;
			border-radius: 0.625rem;
		}

		.advanced a {
			padding: 1.25rem 1.5rem;
		}

		.advanced .type {
			width: 4.25rem;
			height: 2.25rem;
			font: 500 var(--fs-ui-md);
			letter-spacing: 0;
		}

		.advanced .primary {
			font: 500 var(--fs-ui-lg);
			letter-spacing: 0;
		}

		.secondary div {
			width: 12em;
		}

		.secondary div.price-change {
			width: 5em;
			text-align: right;
		}
	}
</style>
