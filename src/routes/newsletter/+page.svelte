<script lang="ts">
	import { Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
</script>

<main class="newsletter-page">
	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style>
	.newsletter-page {
		--section-background: var(--c-background-accent-1);
	}
</style>
