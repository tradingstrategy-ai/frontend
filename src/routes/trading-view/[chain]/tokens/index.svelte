<script context="module" lang="typescript">
	/*

		Render listing of all available exchanges

	 */

	import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

	export async function load({ url, params }){
    const pathTranslations = {
      "trading-view": "Trading data",
		  "exchanges": "Decentralised exchanges",
			"ethereum": "Ethereum",
			"tokens": "Tokens"
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

</script>

<script lang="typescript">
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
	import StaleDataWarning from "$lib/chain/StaleDataWarning.svelte";
	import TokenIndexExplorer from "$lib/explorer/TokenIndexExplorer.svelte";

	export let breadcrumbs;
	export let chain_slug;
</script>

<svelte:head>
	<title>Tokens </title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<div class="container container-main exchanges">
	<Breadcrumb breadcrumbs={breadcrumbs} />
	<div class="row">
		<div class="col-md-12">

			<div class="exchanges">
				<h1>Tokens</h1>

				<p>
					Browse supported decentralised tokens across {chain_slug} <a href="/trading-view/blockchains">blockchain</a> below.
				</p>

				<StaleDataWarning allChains={true} />

				<TokenIndexExplorer
					enabledColumns={["name", "symbol"]}
					orderColumnIndex={1}
					filterJunk={false}
					chainSlug={chain_slug}
				/>
			</div>

		</div>
	</div>
</div>

<style>

.exchanges :global(.col-exchange)  {
	padding-left: 0;
}

.exchanges :global(.col-volume)  {
	width: 10%;
}

.exchanges :global(.col-chain-name)  {
	width: 25%;
}


</style>
