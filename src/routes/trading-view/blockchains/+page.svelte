<!--
	Display chain information and indexing status
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatAmount } from '$lib/helpers/formatters';
	import { Button, ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';

	export let data;
</script>

<svelte:head>
	<title>Trading data for blockchains</title>
	<meta name="description" content="Explore trading pairs and exchanges" />
</svelte:head>

<Breadcrumbs labels={{ blockchains: 'Blockchains' }} />

<ContentCardsTemplate pageTitle="DEX trading view" pageDescription="DEX trading view">
	<HeroBanner slot="hero" title="Blockchains" subtitle="List of currently active blockchains producing trading data." />

	<ContentCardsSection cols={4} --button-width="100%">
		{#each data.chains as chain}
			<ContentCard href={`/trading-view/${chain.chain_slug}`} testId="chain-{chain.chain_id}-{chain.chain_slug}">
				<img
					slot="icon"
					class="blockchain-logo"
					alt={`${chain.chain_name} logo`}
					src={getLogoUrl('blockchain', chain.chain_slug)}
				/>
				<h3 slot="title" class="blockchain-title">{chain.chain_name}</h3>
				<p>{formatAmount(chain.exchanges)} exchanges</p>
				<Button label="Details" />
			</ContentCard>
		{/each}
	</ContentCardsSection>
</ContentCardsTemplate>

<style>
	.blockchain-logo {
		height: 3rem;
		width: 3rem;
	}

	h3.blockchain-title {
		font: var(--f-heading-md-medium);
	}
</style>
