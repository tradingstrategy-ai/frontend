<!--
@component
A page template that includes a HeroBanner header followed by any number of ContentCardSections.
Should be used in conjunction with those two components.

@example

```svelte
	<ContentCardsTemplate pageTitle="For <title> tag" pageDescription="For <meta> description tag">
		<HeroBanner slot="hero" … />
		<ContentCardsSection title="First section">
			<ContentCard title="Content card 1" … />
			<ContentCard title="Content card 2" … />
		</ContentCardsSection>
	</ContentCardsTemplate>
```
-->
<script lang="ts">
	import { Section } from '$lib/components';

	export let pageTitle: string;
	export let pageDescription: string;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<main class="content-cards-template">
	<Section>
		<slot name="hero" />
	</Section>
	<slot />
</main>
