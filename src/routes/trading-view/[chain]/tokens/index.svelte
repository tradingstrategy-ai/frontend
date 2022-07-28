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

<div class="container container-main exchanges">
	<Breadcrumbs />
	<div class="row">
		<div class="col-md-12">
			<div class="exchanges">
				<h1>Tokens</h1>

				<p>
					Browse supported decentralised tokens across {chainSlug}
					<a href="/trading-view/blockchains">blockchain</a> below.
				</p>

				<StaleDataWarning allChains={true} />

				<TokenIndexExplorer
					enabledColumns={['name', 'symbol', 'liquidity_latest', 'volume_24h']}
					orderColumnIndex={2}
					{chainSlug}
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
