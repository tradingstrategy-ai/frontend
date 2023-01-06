<script lang="ts">
	import Section from '$lib/components/Section.svelte';

	export let pageTitle: string;
	export let pageDescription: string;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<main class="content-cards-template">
	<Section class="hero" layout="boxed" padding="md">
		<slot name="hero" />
	</Section>
	<slot />
</main>

<style lang="postcss">
	.content-cards-template :global .hero {
		--section-padding-y: 0 !important;
	}
</style>
