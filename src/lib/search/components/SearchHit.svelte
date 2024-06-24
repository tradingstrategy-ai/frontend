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

	// object returned by Typesense `tradingEntity` search hits; see:
	// https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md
	export let document: DocumentSchema;

	// Pairs below quality threshold are grayed out in the search results.
	// TVL is typically approximately 2 x liquidity, so we double the quality threshold.
	const QUALITY_THRESHOLD: Record<string, number> = {
		liquidity: 50_000,
		tvl: 100_000
	};

	const belowQualityThreshold = document.quality_factors?.some((factor: string) => {
		const value = document[factor];
		const threshold = QUALITY_THRESHOLD[factor];
		return Number.isFinite(value) && Number.isFinite(threshold) && value < threshold;
	});

	// flag low quality results
	const isIncompatibleExchange = document.exchange_type === 'uniswap_v2_incompatible';

	const isLowQuality = belowQualityThreshold || isIncompatibleExchange;

	const hasPrice = Number.isFinite(document.price_change_24h);
	const hasPriceChange = Number.isFinite(document.price_change_24h);

	const labels: Record<string, string> = {
		exchange: 'DEX',
		lending_reserve: 'Reserve'
	};
	const typeLabel = labels[document.type] ?? document.type;

	function getTitle() {
		if (isIncompatibleExchange) return 'Warning: incompatible exchange';
		if (belowQualityThreshold) return 'Warning: low TVL or liquidity';
	}
</script>

<li class="search-hit" title={getTitle()}>
	<a class="tile b" class:isLowQuality href={document.url_path} tabindex="0">
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
	.search-hit {
		--c-exchange: hsl(36, 68%, 35%);
		--c-token: hsl(36, 21%, 54%);
		--c-trading-pair: hsl(239, 6%, 36%);
		--c-lending-reserve: hsl(291, 16%, 43%);

		display: grid;
		list-style-type: none;

		a {
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
			}

			/* see tile.css and UpDownCell.svelte */
			&:focus,
			&:is(:hover, :focus) :global(.up-down-indicator) {
				background: var(--background-hover);
			}

			:global .up-down-cell {
				max-width: min(20vw, 12rem);
			}
		}

		.badge {
			position: relative;
			display: grid;
			align-content: center;
			border-radius: var(--radius-xxs);
			padding-block: var(--space-xs);
			width: 5.625em;
			font: var(--search-hit-badge-font, var(--f-ui-xs-medium));
			letter-spacing: var(--search-hit-badge-spacing, var(--f-ui-xs-spacing, normal));
			color: var(--cm-light, var(--c-text-inverted)) var(--cm-dark, var(--c-text));
			text-transform: capitalize;
			text-align: center;

			&.exchange {
				background: var(--c-exchange);
			}

			&.token {
				background: var(--c-token);
			}

			&.pair {
				background: var(--c-trading-pair);
			}

			&.lending_reserve {
				background: var(--c-lending-reserve);
			}
		}

		.chain-icon {
			position: absolute;
			right: 0;
			bottom: 0;
			display: grid;
			width: 1.6em;
			padding: 0.15em;
			border-radius: 1em;
			transform: translate(50%, 50%);
			background: var(--c-text-inverted);
			box-shadow: var(--shadow-1);
		}

		.info {
			display: grid;
			gap: var(--space-xxs);
			width: 100%;
		}
	}
</style>
