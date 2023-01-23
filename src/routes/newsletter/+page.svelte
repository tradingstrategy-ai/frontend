<script lang="ts">
	import { Section, NewsletterOptInBanner } from '$lib/components';
	import Illustration from '$lib/components/Illustration.svelte';
</script>

<div class="newsletter-page">
	<Section gap="lg" layout="boxed" padding="md">
		<NewsletterOptInBanner>
			<Illustration name="newsletter" slot="artwork" />
			<h3 slot="title">Sign up to newsletter</h3>
			<p slot="description">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat nostrum explicabo fuga repellat. Cumque
				molestias quibusdam numquam! Rerum consectetur dignissimos laboriosam, corporis praesentium itaque quae
				accusamus, mollitia sed fugit eos.
			</p>
		</NewsletterOptInBanner>
	</Section>
</div>

<style lang="postcss">
	:global .newsletter-page .section {
		background: hsla(var(--hsla-background-accent-1));
	}
</style>
