<!-- <script context='module' lang='ts'>
	/*
		Render listing of all available tokens
	*/




	export async function load({ url, params }) {
		const pathTranslations = {
			'trading-view': 'Trading data',
			exchanges: 'Decentralised exchanges',
			ethereum: 'Ethereum',
			tokens: 'Tokens'
		};

		const chain_slug = params.chain;
		const crumbs = buildBreadcrumbs(url.pathname, pathTranslations);

		return {
			props: {
				breadcrumbs: crumbs,
				chain_slug
			}
		};
	}
</script> -->

<script lang='ts'>
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import TokenIndexExplorer from '$lib/explorer/TokenIndexExplorer.svelte';
	import { buildBreadcrumbs } from '$lib/breadcrumb/builder';

	const pathTranslations = {
			'trading-view': 'Trading data',
			exchanges: 'Decentralised exchanges',
			ethereum: 'Ethereum',
			tokens: 'Tokens'
		};

//	const chain_slug = $page.params.chain;
	const crumbs = buildBreadcrumbs($page.url.pathname, pathTranslations);

	export let breadcrumbs;
	export let chain_slug = $page.params.chain;


</script>

<svelte:head>
	<title>Tokens</title>
	<meta name='description' content='Top decentralised exchanges' />
</svelte:head>

<div class='container container-main exchanges'>
	<Breadcrumb {breadcrumbs} />
	<div class='row'>
		<div class='col-md-12'>
			<div class='exchanges'>
				<h1>Tokens</h1>

				<p>
					Browse supported decentralised tokens across {chain_slug}
					<a href='/trading-view/blockchains'>blockchain</a> below.
				</p>

				<StaleDataWarning allChains={true} />

				<TokenIndexExplorer
					enabledColumns={['name', 'symbol', 'liquidity_latest', 'volume_24h']}
					orderColumnIndex={1}
					chainSlug={chain_slug}
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
