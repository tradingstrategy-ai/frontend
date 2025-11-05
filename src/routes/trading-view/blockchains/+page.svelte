<!--
	Display chain information and indexing status
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Button from '$lib/components/Button.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import { chains } from '$lib/helpers/chain';
	import { getLogoUrl } from '$lib/helpers/assets';
</script>

<svelte:head>
	<title>Trading data for blockchains</title>
	<meta name="description" content="Explore trading pairs and exchanges" />
</svelte:head>

<Breadcrumbs labels={{ blockchains: 'Blockchains' }} />

<main class="blockchains-page">
	<Section>
		<HeroBanner title="Blockchains" subtitle="List of currently active blockchains producing trading data." />
	</Section>

	<Section>
		<div class="chains">
			{#each chains as chain (chain.id)}
				<a class="tile b" href={`/trading-view/${chain.slug}`}>
					<img class="tile c" alt={`${chain.name} logo`} src={getLogoUrl('blockchain', chain.slug)} />
					<h3>{chain.name}</h3>
					<Button>View details</Button>
				</a>
			{/each}
		</div>
	</Section>
</main>

<style>
	.chains {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;

		a {
			display: grid;
			padding: 1.5rem;
			gap: 1rem;
			justify-items: center;
			--button-width: clamp(10rem, 50%, 15rem);
		}

		img {
			height: 5rem;
			width: 5rem;
			border-radius: 50%;
			margin-bottom: 0.5rem;
			padding: 1rem;
		}

		h3 {
			font: var(--f-heading-md-medium);
		}
	}
</style>
