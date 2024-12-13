<script lang="ts">
	import type { TradingEntityDocument } from '$lib/search/trading-entities';
	import SearchHit from '$lib/search/components/SearchHit.svelte';
	import SearchHitDescription from '$lib/search/components/SearchHitDescription.svelte';
	import Profitability from '$lib/components/Profitability.svelte';
	import SearchHitMetrics from './SearchHitMetrics.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	export let document: TradingEntityDocument;
</script>

<div class="search-hit-advanced">
	<SearchHit {document} let:isLowQuality>
		<SearchHitDescription {document} {isLowQuality} showWarningIcon />
		<SearchHitMetrics {document} />

		<svelte:fragment slot="price-info" let:hasPrice let:hasPriceChange>
			{#if hasPrice || hasPriceChange}
				<Profitability of={document.price_change_24h} boxed class="price-info">
					{#snippet children({ marker, formatted })}
						{#if hasPrice}
							<span class="truncate">{formatDollar(document.price_usd_latest)}</span>
						{/if}
						{#if hasPriceChange}
							<span class="truncate">{marker} {formatted}</span>
						{/if}
					{/snippet}
				</Profitability>
			{/if}
		</svelte:fragment>
	</SearchHit>
</div>

<style>
	.search-hit-advanced {
		display: contents;
		--search-hit-padding: var(--space-sm) var(--space-sl);

		@media (--viewport-md-up) {
			--search-hit-gap: var(--space-lg);
			--search-hit-padding: var(--space-sl) var(--space-ml);
			--search-hit-badge-font: var(--f-ui-sm-medium);
			--search-hit-badge-spacing: var(--f-ui-sm-spacing, normal);
			--search-hit-description-font: var(--f-ui-lg-medium);
			--search-hit-description-spacing: var(--f-ui-lg-spacing, normal);
		}

		:global(.price-info) {
			display: grid;
			gap: 0.25rem;
			max-width: min(20vw, 12rem);
			padding: 0.5rem 0.75rem;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing);
			text-align: right;
		}
	}
</style>
