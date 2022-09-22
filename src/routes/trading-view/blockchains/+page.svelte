<!--
	Display chain information and indexing status
-->
<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import BlockchainTile from './BlockchainTile.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Trading data for blockchains</title>
	<meta name="description" content="Explore trading pairs and exchanges" />
</svelte:head>

<Breadcrumbs labels={{ blockchains: 'Blockchains' }} />

<main>
	<header class="ds-container">
		<h1>Blockchains</h1>
		<p>List of currently active blockchains producing trading data.</p>
	</header>

	<aside class="ds-container">
		You can explore the blockchains for supported decentralised exchanges, trading pairs and price charts.
	</aside>

	<section class="ds-container">
		{#each data.chains as chain}
			<BlockchainTile
				name={chain.chain_name}
				logo={chain.chain_logo}
				exchanges={chain.exchanges}
				slug={chain.chain_slug}
			/>
		{/each}
	</section>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	header {
		gap: 0.75rem;
	}

	header p,
	aside {
		font: var(--f-h4-roman);
	}

	section {
		grid-template-columns: repeat(auto-fit, minmax(16.5rem, 1fr));
		gap: 2rem;
		padding-block: 1.5rem;
	}

	@media (--viewport-md-up) {
		section {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (--viewport-lg-up) {
		header p {
			font: var(--f-h3-roman);
		}

		aside {
			order: 3;
		}

		section {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
