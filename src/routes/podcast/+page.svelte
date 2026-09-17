<!--
Trading Strategy podcast episode index.
-->
<script lang="ts">
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import BlogRoll from '$lib/components/BlogRoll.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import heroImage from '$lib/assets/illustrations/newspaper-1.svg?raw';

	let { data } = $props();
</script>

<MetaTags
	titleParts={['Podcast', 'Conversations on DeFi and algorithmic trading']}
	description="Listen to the Trading Strategy podcast on YouTube and Spotify for conversations about DeFi vaults, yields and algorithmic trading."
/>

<main class="podcast-index-page">
	<Section tag="header">
		<HeroBanner image={heroImage} title="Trading Strategy Podcast" hr>
			{#snippet subtitle()}
				We interview the smartest onchain strategy quants, vault curators and DeFi masterminds. Find episodes below.
				Listen to us on
				<a
					class="body-link"
					href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
					target="_blank"
					rel="noreferrer">YouTube</a
				>
				and
				<a
					class="body-link"
					href="https://open.spotify.com/show/0BXZEqA3uG5hYZiVYVRZP8"
					target="_blank"
					rel="noreferrer">Spotify</a
				>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="md">
		<BlogRoll posts={data.posts} />
	</Section>
</main>
