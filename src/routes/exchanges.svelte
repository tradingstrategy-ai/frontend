<script context="module">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a
	export async function load({ page, session, fetch, context }) {
		const url = `https://matilda.tradingstrategy.ai/exchanges`;
		const res = await fetch(url);

		const exchanges = await res.json();

		if (res.ok) {
			return {
				props: {
					exchanges: exchanges.exchanges,
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}

</script>

<script>

    
    import { onMount } from 'svelte';
    import Table from "../lib/table/Table.svelte";
    
    export let exchanges = [];
    
    onMount(async () => {

    })

    function formatNumber(n) {
		if(n <= 1000) {
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
		} else{
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
		}
	}

</script>

<svelte:head>
	<title>DEX trading and quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for DEXes">
</svelte:head>

<div class="container container-main">
	<section class="md-12">
		<div class="card">
			<div class="card-body">
				<h1>Exchanges</h1>
                <Table rows={exchanges} />
			</div>
		</div>
	</section>
</div>


<style>
    
</style>