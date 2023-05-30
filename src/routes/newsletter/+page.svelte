<script lang="ts">
	import { Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
</script>

<main class="newsletter-page">
	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style lang="postcss">
	.newsletter-page {
		--section-background: hsla(var(--hsla-background-accent-1));

		& :global .section {
			@media (--viewport-md-up) {
				min-height: calc(100vh - 22.5rem);
			}
		}
	}
</style>
