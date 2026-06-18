<!--
@component
Table cell showing a protocol's CORE3 risk rating letter (e.g. "AA", "BB"),
colour-coded by tone, with a tooltip explaining the rating. Renders an em dash
for protocols that have no CORE3 rating.

@example

```svelte
  <Core3RiskCell rating="BB" slug="morpho" />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { CORE3_METHODOLOGY_URL, getCore3RatingTone } from './helpers';

	interface Props {
		rating?: string | null;
		/** Protocol slug — the tooltip "View more" link points to this protocol's page */
		slug?: string;
	}

	let { rating, slug }: Props = $props();

	let tone = $derived(getCore3RatingTone(rating));
</script>

{#if rating}
	<span class="core3-risk-cell">
		<Tooltip>
			<svelte:fragment slot="trigger">
				<span class="rating" data-tone={tone}>{rating}</span>
			</svelte:fragment>
			<svelte:fragment slot="popup">
				CORE3's protocol risk rating (Probability of Loss): a third-party estimate of how likely users are to suffer a
				financially material loss, graded from AA (lowest risk) down to D.
				<a href={CORE3_METHODOLOGY_URL} target="_blank" rel="noreferrer">View methodology</a>
				{#if slug}<a href={resolve(`/trading-view/vaults/protocols/${slug}`)}>View more</a>{/if}
			</svelte:fragment>
		</Tooltip>
	</span>
{:else}
	<span class="empty">–</span>
{/if}

<style>
	.rating {
		--c-rating: var(--c-text-light);
		font-weight: 600;
		color: color-mix(in srgb, var(--c-text), var(--c-rating) 80%);

		&[data-tone='excellent'] {
			--c-rating: var(--c-success);
		}
		&[data-tone='good'] {
			--c-rating: color-mix(in srgb, var(--c-success), var(--c-warning));
		}
		&[data-tone='fair'] {
			--c-rating: var(--c-warning);
		}
		&[data-tone='poor'] {
			--c-rating: var(--c-error);
		}
	}

	.empty {
		color: var(--c-text-extra-light);
	}

	:global(.core3-risk-cell .tooltip .popup) {
		max-width: 400px;
	}
</style>
