<!--
	Display chain information and indexing status
-->
<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import BlockchainTile from './BlockchainTile.svelte';
	import { PageHeader } from '$lib/components';

	export let data: PageData;
</script>

<svelte:head>
	<title>Trading data for blockchains</title>
	<meta name="description" content="Explore trading pairs and exchanges" />
</svelte:head>

<Breadcrumbs labels={{ blockchains: 'Blockchains' }} />

<main>
	<PageHeader title="Blockchains" description="List of currently active blockchains producing trading data." />

	<section class="ds-container">
		{#each data.chains as chain}
			<BlockchainTile name={chain.chain_name} exchanges={chain.exchanges} slug={chain.chain_slug} />
		{/each}
	</section>

	<aside class="ds-container">
		You can explore the blockchains for supported decentralised exchanges, trading pairs and price charts.
	</aside>
</main>

<style lang="postcss">
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	section {
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-xl);
		padding-block: var(--space-lg);

		@media (--viewport-md-down) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (--viewport-sm-down) {
			grid-template-columns: repeat(auto-fit, minmax(16.5rem, 1fr));
			--container-margin: var(--space-xl);
		}
	}

	aside {
		font: var(--f-h4-roman);

		@media (--viewport-sm-down) {
			--container-margin: var(--space-xl);
		}
	}
</style>
