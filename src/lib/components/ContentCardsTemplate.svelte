<script lang="ts">
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';

	export let heroImage: any;
	export let heroTitle: string;
	export let heroSubtitle: string;
	export let pageTitle: string;
	export let pageDescription: string;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<main class="content-cards-template">
	<Section class="hero" layout="boxed" padding="md">
		<HeroBanner image={heroImage} title={heroTitle} subtitle={heroSubtitle} />
	</Section>
	<slot />
</main>

<style global>
	.content-cards-template .hero {
		--section-padding-y: 0 !important;
	}
</style>
