<script lang="ts">
	import { Section } from '$lib/components';

	export let cols = 2;
	export let title: string;
</script>

<Section class="content-cards" {cols} layout="boxed" padding="lg" {title}>
	<slot />
</Section>

<style global lang="postcss">
	section.content-cards {
		--section-padding-y: var(--space-ml) !important;
		@media (--viewport-xs) {
			--section-padding-y: var(--space-ms) !important;
		}
		margin-bottom: var(--space-xl);

		& .grid {
			--grid-gap: var(--space-ll) !important;
			@media (--viewport-xs) {
				--grid-gap: var(--space-ls) !important;
			}
		}

		& h2 {
			font: var(--f-heading-md-medium) !important;
			text-align: left;
			@media (--viewport-xs) {
				font: var(--f-heading-sm-medium) !important;
			}
		}
	}
</style>
