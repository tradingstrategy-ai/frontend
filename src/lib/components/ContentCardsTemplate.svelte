<!--
@component
A page template that includes a HeroBanner header followed by any number of ContentCardSections.
Should be used in conjunction with those two components.

The page title and meta description go through `SocialCardMetaTags` (brand suffix, social image).

@example

```svelte
	<ContentCardsTemplate titleParts={['Community']} description="For the <meta> description tag">
		{#snippet hero()}
			<HeroBanner … />
		{/snippet}
		<ContentCardsSection title="First section">
			<ContentCard title="Content card 1" … />
			<ContentCard title="Content card 2" … />
		</ContentCardsSection>
	</ContentCardsTemplate>
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Section } from '$lib/components';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	interface Props {
		/** Title fragments, most specific first; see `getPageTitle` */
		titleParts: string[];
		description: string;
		hero: Snippet;
		children: Snippet;
	}

	let { titleParts, description, hero, children }: Props = $props();
</script>

<MetaTags {titleParts} {description} />

<main class="content-cards-template">
	<Section>
		{@render hero()}
	</Section>
	{@render children()}
</main>
