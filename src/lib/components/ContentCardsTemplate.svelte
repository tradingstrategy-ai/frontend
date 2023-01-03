<script lang="ts">
	import ContentCardsSection from '$lib/components/ContentCardsSection.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';

	export let cols = 2;
	export let contentCardsSections: any = [];
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

<main>
	<Section layout="boxed">
		<HeroBanner image={heroImage} title={heroTitle} subtitle={heroSubtitle} />
	</Section>

	{#each contentCardsSections as { cards, title }}
		<ContentCardsSection {cards} {cols} {title} />
	{/each}
</main>
