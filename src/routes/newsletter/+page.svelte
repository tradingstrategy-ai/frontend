<script lang="ts">
	import { NewSection } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
</script>

<main class="newsletter-page">
	<NewSection padding="md">
		<NewsletterOptInBanner />
	</NewSection>
</main>

<style lang="postcss">
	.newsletter-page {
		--section-background: hsla(var(--hsla-background-accent-1));
	}
</style>
