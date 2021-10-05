<script context="module" lang="typescript">
	import { browser, dev } from '$app/env';

	export const hydrate = dev;
	export const router = browser;

	export async function load({ fetch }) {
		const url = `https://matilda.tradingstrategy.ai/exchanges`;
		const res = await fetch(url);


		if (res.ok) {
			const exchanges = await res.json();
			return {
				props: {
					exchanges: exchanges.exchanges,
					apiError: undefined
				}
			};
		}

		const errorTypes = {
			'404': {
				status: 404,
				message: `can get exchanges data from our API, our team is probably already working to solve this issue`
			}
		}

		return {
			props: {
				exchanges: [],
				apiError: `Could not load, ${errorTypes[res.status].message}`
			}
		};
	}
</script>

<script lang="typescript">

	import { onMount, tick } from 'svelte';
	import Table from '../lib/table/Table.svelte';
	import Datatable from '../lib/Datatables/datatable.svelte';

	export let exchanges = [];

	const columns = [ 'id', 'name', 'USD Volume'];
	const options = {
		order: [[ 2, "desc" ]],
		serverSide: false,
		ajax: {
            url: 'https://matilda.tradingstrategy.ai/exchanges',
            type: 'GET',
			dataSrc: function ( { exchanges } ) {
				return exchanges.map((exchange) => [
					exchange.exchange_id,
					`<a class="nav-link" href="/ethereum/${exchange.exchange_slug}">${exchange.human_readable_name}</a>`,
					exchange.usd_volume_30d ]
				);
   		    }
        }
	}

	onMount(async () => {
		if (browser) {
            const initDt = (await import('datatables.net-dt')).default;
			initDt();
		}
	});

	const load = async () => {
		const exchangeData = exchanges.map((exchange) => {
			return [ exchange.exchange_id, exchange.human_readable_name, exchange.usd_volume_30d ]
		});
	    return exchangeData;
    }
</script>

<svelte:head>
	<title>DEX trading and quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for DEXes" />
</svelte:head>

<div class="container container-main">
	<section class="md-12">
		<div class="card">
				<div class="card-body">
					<h1>Exchanges</h1>
					<Datatable
					 	columns={columns}
					    options={options}
					/>
				</div>
		</div>
	</section>
</div>

<style>
</style>
