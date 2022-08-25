<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import TokenIndexExplorer from '$lib/explorer/TokenIndexExplorer.svelte';

	const chainSlug = $page.params.chain;
</script>

<svelte:head>
	<title>Tokens</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main>
	<header class="ds-container">
		<h1>Tokens</h1>
		<p>
			Browse supported decentralised tokens across {chainSlug} <a href="/trading-view/blockchains">blockchain</a> below.
		</p>
	</header>

	<section class="ds-container">
		<StaleDataWarning allChains={true} />
		<TokenIndexExplorer
			enabledColumns={['name', 'symbol', 'liquidity_latest', 'volume_24h']}
			orderColumnIndex={2}
			{chainSlug}
		/>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 1rem;
	}

	.ds-container {
		gap: 1rem;
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	section :global .col-exchange {
		padding-left: 0;
	}

	section :global .col-volume {
		width: 10%;
	}

	section :global .col-chain-name {
		width: 25%;
	}
</style>
