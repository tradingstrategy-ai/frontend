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
		<p>Browse supported decentralised exchanges across all blockchains.</p>
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

<style lang="postcss">
	main {
		display: grid;
		gap: 1rem;
	}

	header {
		gap: 0.75rem;

		& p {
			font: var(--f-h4-roman);

			@media (--viewport-lg-up) {
				font: var(--f-h3-roman);
			}
		}
	}
</style>
