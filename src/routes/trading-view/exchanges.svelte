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

<div class="container container-main exchanges">
	<Breadcrumbs />
	<div class="row">
		<div class="col-md-12">
			<div class="exchanges">
				<h1>Decentralised exchanges</h1>

				<p>
					Browse supported decentralised exchanges across all <a href="/trading-view/blockchains">blockchains</a> below.
				</p>

				<StaleDataWarning allChains={true} />

				<ExchangeExplorer
					enabledColumns={['human_readable_name', 'chain_name', 'pair_count', 'usd_volume_30d']}
					orderColumnIndex={3}
					filterJunk={false}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.exchanges :global(.col-exchange) {
		padding-left: 0;
	}

	.exchanges :global(.col-volume) {
		width: 10%;
	}

	.exchanges :global(.col-chain-name) {
		width: 25%;
	}
</style>
