<script lang="ts">
	import { ContentCardsSection, ContentCard } from '$lib/components';
</script>

<main class="glossary-layout">
	<slot />

	<ContentCardsSection>
		<ContentCard icon="dictionary" title="DeFi Dictionary" ctaLabel="View dictionary" href="/glossary">
			<p>Browse and learn DeFi, trading and technical analysis terminology.</p>
		</ContentCard>
		<ContentCard
			icon="book"
			title="Documentation"
			ctaLabel="Read documentation"
			href="https://tradingstrategy.ai/docs"
			description="Trading Strategy provides Python libraries for strategy development and execution for decentralised exchanges. Read API documentation and tutorials to learn how to create your own strategies."
		/>
	</ContentCardsSection>
</main>

<style lang="postcss">
	.glossary-layout {
		display: grid;
		gap: var(--space-lg);

		@media (--viewport-sm-down) {
			gap: var(--space-ms);
		}
	}
</style>
