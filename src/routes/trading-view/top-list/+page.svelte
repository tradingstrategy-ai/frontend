<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button, ContentCard, ContentCardsSection, HeroBanner, Section } from '$lib/components';
	import IconTrendUp from '~icons/local/trend-up';
	import IconTrendDown from '~icons/local/trend-down';
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
		<ContentCard href="/trading-view/top-list/daily-up" --icon-color="var(--c-bullish)">
			<IconTrendUp slot="icon" />
			<h3 slot="title">Top daily up</h3>
			<p>
				Trading pairs that have gained most profit for the last 24h. Investing to these trading pairs would have been
				the most profitable trade.
			</p>
			<Button slot="cta" label="View daily up" />
		</ContentCard>

		<ContentCard href="/trading-view/top-list/daily-down" --icon-color="var(--c-bearish)">
			<IconTrendDown slot="icon" />
			<h3 slot="title">Top daily down</h3>
			<p>
				Trading pairs that have lost most value for the last 24h. Holding these tokens would have caused most losses.
			</p>
			<Button slot="cta" label="View daily down" />
		</ContentCard>
	</ContentCardsSection>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-xl);
	}
</style>
