<!--
	Newsletter sign-up page
-->
<script lang="ts">
	import { Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
</script>

<MetaTags
	titleParts={['Newsletter', 'DeFi vault and yield updates']}
	description="Subscribe to the Trading Strategy newsletter for the best new DeFi vaults, stablecoin yields and essential DeFi updates in your inbox."
/>

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
