<!--
@component
Used for displaying search results; displays a single TradingEntityDocument
line item; supports basic (top-nav) search results, or advanced layout via
slots.

If `document` prop is `undefined`, a skeleton loader is rendered.

#### Usage:
```tsx
  <SearchHit {document} />
```
-->
<script lang="ts">
	import type { TradingEntityDocument } from '../trading-entities';
	import { formatPercent } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { Icon, UpDownCell } from '$lib/components';
	import SearchHitDescription from './SearchHitDescription.svelte';

	export let document: TradingEntityDocument | undefined = undefined;

	// Pairs below quality threshold are grayed out in the search results.
	// TVL is typically approximately 2 x liquidity, so we double the quality threshold.
	const QUALITY_THRESHOLD: Record<string, number> = {
		liquidity: 50_000,
		tvl: 100_000
	};

	const belowQualityThreshold = document?.quality_factors?.some((factor: string) => {
		const value = document[factor];
		const threshold = QUALITY_THRESHOLD[factor];
		return Number.isFinite(value) && Number.isFinite(threshold) && value < threshold;
	});

	// flag low quality results
	const isIncompatibleExchange = document?.exchange_type === 'uniswap_v2_incompatible';

	const isLowQuality = belowQualityThreshold || isIncompatibleExchange;

	const hasPrice = Number.isFinite(document?.price_change_24h);
	const hasPriceChange = Number.isFinite(document?.price_change_24h);

	function getTypeLabel({ type }: TradingEntityDocument) {
		if (type === 'exchange') return 'DEX';
		if (type === 'lending_reserve') return 'Reserve';
		return type;
	}

	function getTitle() {
		if (isIncompatibleExchange) return 'Warning: incompatible exchange';
		if (belowQualityThreshold) return 'Warning: low TVL or liquidity';
	}
</script>

<li class="search-hit" title={getTitle()}>
	{#if document}
		<a class="inner tile b" class:isLowQuality href={document.url_path} tabindex="0">
			<div class="badge {document.type}">
				{getTypeLabel(document)}
				<img class="chain-icon" src={getLogoUrl('blockchain', document.blockchain)} alt={document.blockchain} />
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
	{:else}
		<!-- skeleton loader -->
		<div class="inner tile b">
			<div class="badge skeleton">-</div>
			<div class="info">
				<slot {isLowQuality}>
					<div class="skeleton" style:width="clamp(12ch, 75%, 35ch)">-</div>
					<div class="skeleton" style:width="clamp(6ch, 40%, 20ch)">-</div>
				</slot>
			</div>
			<slot name="price-info" {hasPrice} {hasPriceChange}>
				<div class="skeleton" style:width="5ch" style:height="2em">-</div>
			</slot>
		</div>
	{/if}
</li>

<style lang="postcss">
	.search-hit {
		--c-exchange: hsl(36, 68%, 35%);
		--c-token: hsl(36, 21%, 54%);
		--c-trading-pair: hsl(239, 6%, 36%);
		--c-lending-reserve: hsl(291, 16%, 43%);

		display: grid;
		list-style-type: none;

		.inner {
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
			width: 1.6em;
			height: 1.6em;
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
