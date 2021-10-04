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
	import Table from '../lib/table/Table.svelte';
	import Datatable from '../lib/Datatables/datatable.svelte';

	export let exchanges = [];
	export let apiError;

	function formatNumber(n) {
		if (n <= 1000) {
			return (n / 1000).toLocaleString('en', {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			});
		} else {
			return (n / 1000).toLocaleString('en', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		}
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
					<Datatable />
					<h1>Exchanges</h1>
					<Table rows={exchanges} apiError={apiError}/>
				</div>
		</div>
	</section>
</div>

<style>
</style>
