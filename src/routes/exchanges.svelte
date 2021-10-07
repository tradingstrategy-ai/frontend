<script context="module" lang="typescript">

	/*

		Render listing of all available exchanges

	 */

	import { browser } from '$app/env';
	export const router = browser;
	import { backendUrl } from '$lib/config';
</script>

<script lang="typescript">
	import { onMount } from 'svelte';
	import Datatable from '$lib/datatable/datatable.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	// https://tradingstrategy.ai/api/explorer/
	// See https://datatables.net/reference/option/columns
	const columns = [
		{
			name: "Exchange",
			className: "col-exchange",
			data: "human_readable_name",
			// https://datatables.net/reference/option/columns.render
			render: function(data, type, row, meta) {
				return `<a href="/${row.chain_slug}/${row.exchange_slug}">${row.human_readable_name}</a>`;
			}
		},
		{
			name: "Volume 30d (USD)",
			data: "usd_volume_30d",
			className: "col-volume",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatDollar(data);
			}
		}
	];

	const options = {
	    order: [[ 1, "desc" ]],
		searching: false,
		serverSide: false,
		lengthChange: false,
		// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
		ajax: {
            url: `${backendUrl}/exchanges`,
            type: 'GET',
			dataSrc: function (resp) {
				return resp.exchanges;
			}
        }
	}

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
					clickableRows={true}
					dataCy="exchange-table"
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
