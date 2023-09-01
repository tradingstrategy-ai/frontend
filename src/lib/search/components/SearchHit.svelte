<!--
@component
Used for displaying search results; displays a single `$tradingEntity` result
line item; supports basic (top-nav) search results, or advanced layout via
props.

#### Usage:
```tsx
  <SearchHit {document} />
```
-->
<script lang="ts">
	import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';
	import { formatPercent } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { Icon, UpDownCell } from '$lib/components';
	import SearchHitDescription from './SearchHitDescription.svelte';

	// Any token with less than this liquidity is grayed out in the search results
	const LIQUIDITY_QUALITY_THRESHOLD = 50_000;

	// object returned by Typesense `tradingEntity` search hits; see:
	// https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md
	export let document: DocumentSchema;

	// flag low quality results
	const hasLiquidityFactor = document.quality_factors?.includes('liquidity');
	const hasLowLiquidity = hasLiquidityFactor && document.liquidity < LIQUIDITY_QUALITY_THRESHOLD;
	const isIncompatibleExchange = document.exchange_type === 'uniswap_v2_incompatible';
	const isLowQuality = hasLowLiquidity || isIncompatibleExchange;

	const hasPrice = Number.isFinite(document.price_change_24h);
	const hasPriceChange = Number.isFinite(document.price_change_24h);

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

<li class="search-hit" title={getTitle()}>
	<a class="tile b" class:isLowQuality href={document.url_path}>
		<div class="badge {document.type}">
			{typeLabel}
			<div class="chain-icon">
				<img src={getLogoUrl('chain', document.blockchain)} alt={document.blockchain} />
			</div>
		</div>
		<div class="info">
			<slot {isLowQuality}>
				<SearchHitDescription {document} {isLowQuality} />
			</slot>
		</div>

		<slot name="price-info" {hasPrice} {hasPriceChange}>
			{#if isLowQuality}
				<Icon name="warning" size="20px" />
			{:else if hasPriceChange}
				<UpDownCell value={document.price_change_24h} formatter={(val) => formatPercent(Math.abs(val))} />
			{/if}
		</slot>
	</a>
</li>

<style lang="postcss">
	.exchange {
		background-color: var(--c-wood);
	}

	.token {
		background-color: var(--c-parchment-super-dark);
	}

	.pair {
		background-color: var(--c-gray-dark);
	}

	.lending_reserve {
		background-color: #7a5c7f;
	}

	.search-hit {
		display: grid;
		list-style-type: none;

		& a {
			display: grid;
			gap: var(--search-hit-gap, var(--space-md));
			grid-template-columns: auto 1fr auto;
			place-content: center stretch;
			place-items: center stretch;
			outline: none;
			transition: all var(--time-sm) ease-out;

			padding: var(--search-hit-padding, var(--space-ms) var(--space-sl));
			@media (--viewport-sm-up) {
				padding: var(--search-hit-padding, var(--space-md) var(--space-sl));
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
				background: var(--background-hover); /* see tile.css */
			}

			& :global .up-down-cell {
				max-width: min(20vw, 12rem);
			}
		}

		& .badge {
			position: relative;
			display: grid;
			align-content: center;
			border-radius: var(--radius-xxs);
			padding-block: var(--space-xs);
			width: 5.625em;
			font: var(--search-hit-badge-font, var(--f-ui-xs-medium));
			letter-spacing: var(--search-hit-badge-spacing, var(--f-ui-xs-spacing, normal));
			color: var(--c-parchment);
			text-transform: capitalize;
			text-align: center;
		}

		& .chain-icon {
			position: absolute;
			right: 0;
			bottom: 0;
			display: grid;
			width: 1.6em;
			padding: 0.15em;
			border-radius: 1em;
			transform: translate(50%, 50%);
			background: hsla(var(--hsl-text-inverted));
			box-shadow: 0 0 1px 1px var(--c-shadow-1-v1);
		}

		& .info {
			display: grid;
			gap: var(--space-xxs);
			width: 100%;
		}
	}
</style>
