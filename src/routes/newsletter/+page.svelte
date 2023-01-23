<script lang="ts">
	import { Section, NewsletterOptInBanner } from '$lib/components';
	import Illustration from '$lib/components/Illustration.svelte';
</script>

<div class="newsletter-page">
	<Section gap="lg" layout="boxed" padding="md">
		<NewsletterOptInBanner />
	</Section>
</div>

<style lang="postcss">
	:global .newsletter-page .section {
		background: hsla(var(--hsla-background-accent-1));
	}
</style>
