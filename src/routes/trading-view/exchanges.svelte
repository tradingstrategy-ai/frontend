<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import ExchangeExplorer from '$lib/explorer/ExchangeExplorer.svelte';
</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main>
	<header class="ds-container">
		<h1>Decentralised exchanges</h1>
		<p>
			Browse supported decentralised exchanges across all <a href="/trading-view/blockchains">blockchains</a> below.
		</p>
	</header>

	<section class="ds-container">
		<StaleDataWarning allChains={true} />

		<ExchangeExplorer
			enabledColumns={['human_readable_name', 'chain_name', 'pair_count', 'usd_volume_30d']}
			orderColumnIndex={3}
			filterJunk={false}
		/>
	</section>
</main>

<style>
	.ds-container {
		grid-template-columns: auto;
		gap: 0;
	}

	header h1 {
		font: var(--f-h2-medium);
		margin-bottom: 0.5rem;
	}

	section {
		margin-top: 1rem;
	}

	section :global .col-volume {
		width: 10%;
	}

	section :global .col-chain-name {
		width: 25%;
	}
</style>
