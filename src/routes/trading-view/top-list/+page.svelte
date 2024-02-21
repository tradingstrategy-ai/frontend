<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { ContentCard, ContentCardsSection, HeroBanner, Section } from '$lib/components';
</script>

<svelte:head>
	<title>Top lists for DEX trading</title>
	<meta name="description" content="Most volatile trading pairs" />
</svelte:head>

<Breadcrumbs labels={{ 'top-list': 'Top lists' }} />

<main>
	<Section tag="header">
		<HeroBanner contentFullWidth title="Top lists" subtitle="Explore currently the most volatile trading pairs." />
	</Section>

	<ContentCardsSection>
		<ContentCard
			ctaLabel="View daily up"
			href="/trading-view/top-list/daily-up"
			icon="trend-up"
			--icon-color="var(--c-bullish)"
		>
			<h3 slot="title">Top daily up</h3>
			<p>
				Trading pairs that have gained most profit for the last 24h. Investing to these trading pairs would have been
				the most profitable trade.
			</p>
		</ContentCard>

		<ContentCard
			ctaLabel="View daily down"
			href="/trading-view/top-list/daily-down"
			icon="trend-down"
			--icon-color="var(--c-bearish)"
		>
			<h3 slot="title">Top daily down</h3>
			<p>
				Trading pairs that have lost most value for the last 24h. Holding these tokens would have caused most losses.
			</p>
		</ContentCard>
	</ContentCardsSection>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-xl);
	}
</style>
