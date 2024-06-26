<script lang="ts">
	import type { TradingEntityDocument } from '$lib/search/trading-entities';
	import { SearchHit, SearchHitDescription } from '$lib/search/components';
	import { UpDownCell } from '$lib/components';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import SearchHitMetrics from './SearchHitMetrics.svelte';

	export let document: TradingEntityDocument;
</script>

<div class="search-hit-advanced">
	<SearchHit {document} let:isLowQuality>
		<SearchHitDescription {document} {isLowQuality} showWarningIcon />
		<SearchHitMetrics {document} />

		<svelte:fragment slot="price-info" let:hasPrice let:hasPriceChange>
			{#if hasPrice || hasPriceChange}
				<UpDownCell value={document.price_change_24h}>
					{#if hasPrice}
						<span class="truncate">{formatDollar(document.price_usd_latest)}</span>
					{/if}
					{#if hasPriceChange}
						<span class="truncate">{formatPriceChange(document.price_change_24h)}</span>
					{/if}
				</UpDownCell>
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

		.truncate {
			white-space: nowrap;
		}
	}
</style>
