<!--
@component
A section component to display a collection of ContentCards in a responsive grid layout.

### Usage:
```tsx
	<ContentCardsSection cols={3} title="First section">
		<ContentCard title="Content card 1" … />
		<ContentCard title="Content card 2" … />
	</ContentCardsSection>
```
-->
<script lang="ts">
	import { Section } from '$lib/components';

	export let cols = 2;
	export let title: string;
</script>

<div class="content-cards">
	<Section {cols} layout="boxed" padding="lg" {title}>
		<slot />
	</Section>
</div>

<style lang="postcss">
	.content-cards :global .section {
		--section-padding-y: var(--space-ml) !important;
		@media (--viewport-xs) {
			--section-padding-y: var(--space-ms) !important;
		}
		margin-bottom: var(--space-xl);

		& .grid {
			--grid-gap: var(--space-ll) !important;
			@media (--viewport-xs) {
				--grid-gap: var(--space-lg) !important;
			}
		}

		& h2 {
			font: var(--f-heading-md-medium) !important;
			text-align: left;
			@media (--viewport-xs) {
				font: var(--f-heading-md-medium) !important;
			}
		}
	}
</style>
