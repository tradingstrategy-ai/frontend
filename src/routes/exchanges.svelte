<script context="module" lang="typescript">

	/*

		Render listing of all available exchanges

	 */

	import { browser } from '$app/env';
	export const router = browser;
	import { backendUrl } from '$lib/config';
</script>

<script lang="typescript">
	import { onMount, tick } from 'svelte';
	import Datatable from '../lib/Datatables/datatable.svelte';
	import { formatNumber } from '$lib/helpers/formatters';

	const columns = [ 'Name', 'Volume 24h (USD)'];
	const options = {
	    order: [[ 1, "desc" ]],
		serverSide: false,
		ajax: {
            url: `${backendUrl}/exchanges`,
            type: 'GET',
			dataSrc: function ({ exchanges }) {
				return exchanges.map((exchange) => [
					//exchange.exchange_id,
					`<a class="nav-link" href="/ethereum/${exchange.exchange_slug}">${exchange.human_readable_name}</a>`,
					formatNumber(exchange.usd_volume_30d) ]
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

</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Supported decentralised exchanges for Trading Strategy algorithms" />
</svelte:head>

<div class="container container-main">
	<section class="md-12">
		<div class="card">
				<div class="card-body">
					<h1>Exchanges</h1>

					<p>
						Trading Strategy oracle network connects to the following exchanges. Choose an exchange to explore its trading pairs.
					</p>

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
