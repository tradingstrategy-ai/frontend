<script lang="ts">
	import { ContentCard, Section } from '$lib/components';
	import type { SectionSizing } from '$lib/types';

	interface ContentCard {
		href: string;
		iconName: string;
		title: string;
		subtitle: string;
		summaryLabel: string;
		summaryValue: string;
	}

	export let cards: ContentCard[];
	export let cols = 2;
	export let title: string;
</script>

<Section class="content-cards" {cols} layout="boxed" padding="lg" {title}>
	{#each cards as card}
		<ContentCard
			href={card.href}
			iconName={card.iconName}
			title={card.title}
			subtitle={card.subtitle}
			summaryLabel={card.summaryLabel}
			summaryValue={card.summaryValue}
		/>
	{/each}
</Section>

<style global lang="postcss">
	section.content-cards {
		--section-padding-y: var(--space-ml) !important;
		@media (--viewport-xs) {
			--section-padding-y: var(--space-ms) !important;
		}
		margin-bottom: var(--space-xl);

		& .grid {
			--grid-gap: var(--space-ll) !important;
			@media (--viewport-xs) {
				--grid-gap: var(--space-ls) !important;
			}
		}

		& h2 {
			font: var(--f-heading-md-medium) !important;
			text-align: left;
			@media (--viewport-xs) {
				font: var(--f-heading-sm-medium) !important;
			}
		}
	}
</style>
