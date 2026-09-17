<!--
	Home page
-->
<script lang="ts">
	import DebugFreshnessData from '$lib/components/DebugFreshnessData.svelte';
	import HomeHeroBanner from './_components/HomeHeroBanner.svelte';
	import FeaturedStrategies from './_components/FeaturedStrategies.svelte';
	import TopVaults from './_components/TopVaults.svelte';
	import VaultEcosystem from './_components/VaultEcosystem.svelte';

	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import BlogRoll from '$lib/components/BlogRoll.svelte';
	import Button from '$lib/components/Button.svelte';
	import Section from '$lib/components/Section.svelte';
	import { organizationSchema, sitelinksSearchBox } from '$lib/helpers/google-meta';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();

	let { posts, strategies, topVaults, savingsRate, treasuryRate } = $derived(data);

	const title = 'DeFi vault rankings, yields and risk data | Trading Strategy';
	const description =
		'Compare 3,000+ DeFi vaults by yield, TVL, risk and fees across every major chain and protocol, with on-chain performance history, curator and stablecoin data.';
</script>

<MetaTags {title} {description} openGraph={{ title: 'Trading Strategy — DeFi vault rankings, yields and risk data' }} />

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html sitelinksSearchBox()}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html organizationSchema()}
</svelte:head>

<main class="home-page">
	<DebugFreshnessData label="home-page" data={data.debugFreshness} />

	<HomeHeroBanner />

	<FeaturedStrategies {strategies} />

	{#if topVaults}
		<TopVaults vaults={topVaults.vaults} aggregates={topVaults.aggregates} />
		<VaultEcosystem {savingsRate} {treasuryRate} />
	{/if}

	{#if posts}
		<Section padding="md" gap="md" --section-background="var(--c-background-accent-1)">
			<h2>Blog</h2>
			<BlogRoll {posts} />
			<div style:text-align="center">
				<Button secondary label="Read all posts" href="/blog" />
			</div>
		</Section>
	{/if}

	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style>
	h2 {
		text-align: center;
	}

	.home-page :global(section > h2),
	.home-page :global(section > header > h2) {
		font: var(--f-ui-xxxl-medium);
		letter-spacing: var(--f-ui-xxxl-spacing, -0.01em);

		@media (--viewport-sm-down) {
			font: var(--f-ui-xxl-medium);
			letter-spacing: var(--f-ui-xxl-spacing, -0.01em);
		}
	}

	/* limit to 3 posts on larger viewports (single row) */
	@media (width >= 1140px) {
		.home-page :global(.blog-roll > :nth-child(4)) {
			display: none;
		}
	}
</style>
