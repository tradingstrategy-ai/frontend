<!--
@component
A section component to display a collection of ContentCards in a responsive grid layout.

@example

```svelte
	<ContentCardsSection cols={3} title="First section">
		<ContentCard title="Content card 1" … />
		<ContentCard title="Content card 2" … />
	</ContentCardsSection>
```
-->
<script lang="ts">
	import { Grid, Section } from '$lib/components';

	export let cols = 2;
	export let title: string | undefined = undefined;
</script>

<div class="content-cards-section">
	<Section>
		{#if title}
			<h2>{title}</h2>
		{/if}
		<Grid {cols}>
			<slot />
		</Grid>
	</Section>
</div>

<style>
	.content-cards-section {
		margin-bottom: var(--space-xl);
		--section-padding: var(--space-ml);
		--section-gap: var(--space-ls);
		--grid-gap: var(--space-ll);

		@media (--viewport-xs) {
			--section-padding: var(--space-ms);
			--section-gap: var(--space-sm);
			--grid-gap: var(--space-ls);
		}

		h2 {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);

			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}
		}
	}
</style>
