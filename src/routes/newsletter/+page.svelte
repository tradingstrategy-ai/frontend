<script lang="ts">
	import { Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
</script>

<div class="newsletter-page">
	<Section gap="lg" layout="boxed" padding="md">
		<NewsletterOptInBanner />
	</Section>
</div>

<style lang="postcss">
	.newsletter-page :global .section {
		background: hsla(var(--hsla-background-accent-1));
	}
</style>
