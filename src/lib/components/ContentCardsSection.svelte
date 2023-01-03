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
	export let gap: SectionSizing = 'lg';
	export let title: string;
</script>

<Section class="content-cards" {cols} {gap} layout="boxed" {title}>
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
		--section-padding-y: var(--space-ls) !important;
		margin-bottom: var(--space-xl);

		& h2 {
			font: var(--f-heading-md-medium) !important;
			text-align: left;
		}
	}
</style>
