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

	const columns = [
		{
			name: "Exchange",
			className: "col-exchange"
		},
		{
			name: "Volume 24h (USD)",
			className: "col-volume"
		}
	];

	const options = {
	    order: [[ 1, "desc" ]],
		searching: false,
		serverSide: false,
		lengthChange: false,
		ajax: {
            url: `${backendUrl}/exchanges`,
            type: 'GET',
			dataSrc: function ({ exchanges }) {
				return exchanges.map((exchange) => [
					//exchange.exchange_id,
					`<a href="/ethereum/${exchange.exchange_slug}">${exchange.human_readable_name}</a>`,
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

<div class="container container-main exchanges">
	<div class="row">
		<div class="col-md-12">

			<div class="exchanges-content">
				<h1>Decentralised exchanges</h1>

				<p>
					Trading Strategy oracle network connects to the following exchanges. Choose an exchange to explore its trading pairs.
				</p>

				<Datatable
					columns={columns}
					options={options}
				/>
			</div>

		</div>
	</div>
</div>

<style>

.exchanges-content {
	margin: 60px 0;
}

.exchanges :global(.col-exchange)  {
	width: 75%;
	padding-left: 0;
}

.exchanges :global(.col-volume)  {
	width: 25%;
}

</style>
