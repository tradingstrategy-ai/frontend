<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button, ContentCard, ContentCardsSection, HeroBanner, Section } from '$lib/components';
</script>

<svelte:head>
	<title>Top lists for DEX trading</title>
	<meta name="description" content="Most volatile trading pairs" />
</svelte:head>

<Breadcrumbs labels={{ 'top-list': 'Top lists' }} />

<main>
	<Section header layout="boxed">
		<HeroBanner title="Top lists" subtitle="Explore currently the most volatile trading pairs." />
	</Section>

	<ContentCardsSection>
		<ContentCard
			ctaLabel="View daily up"
			href="/trading-view/top-list/daily-up"
			icon="trend-up"
			--icon-color="hsla(var(--hsl-bullish))"
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
			--icon-color="hsla(var(--hsl-bearish))"
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

	header {
		& h1 {
			font: var(--f-heading-xl-medium);
			margin-bottom: var(--space-sm);
		}

		& p {
			font: var(--f-heading-md-roman);
			@media (--viewport-sm-down) {
				font: var(--f-heading-sm-roman);
			}
		}
	}

	section {
		gap: var(--space-xl);
		grid-template-columns: repeat(auto-fit, minmax(min(30rem, calc(100vw - 10rem)), 1fr));
	}

	.card {
		padding: var(--space-xl);
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: var(--space-md);
	}

	.media {
		display: flex;
		justify-content: center;
	}

	svg {
		width: 90%;
		max-width: 8rem;

		& .icons-duotone-1 {
			fill: hsla(var(--hsl-bullish));
		}

		& .icons-duotone-2 {
			fill: hsla(var(--hsl-bearish));
		}
	}

	.content {
		display: grid;
		gap: var(--space-md);

		& h3 {
			font: var(--f-heading-md-medium);
		}

		& p {
			font: var(--f-ui-md-roman);
		}
	}
</style>
