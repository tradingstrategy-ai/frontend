<script context="module" lang="typescript">
	/*

		Render listing of all available exchanges

	 */
	import { browser } from '$app/env';
	export const router = browser;
	import { backendUrl } from '$lib/config';
	import { buildBreadcrumbs } from '$lib/helpers/html';
    import breadcrumbTranslations from '$lib/constants/Breadcrumb';


	export async function load({page}){
      // using the page object from the Input object we can get the param
      // In the return value of this function we can specify props
	  const readableNames = {
        ...breadcrumbTranslations
      };

	  return {
        props: {
      		breadcrumbs: buildBreadcrumbs(page.path, readableNames)
        }
      };
    }

</script>

<script lang="typescript">
	import { onMount } from 'svelte';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
	import Datatable from '$lib/datatable/datatable.svelte';


	import { formatDollar, formatAmount } from '$lib/helpers/formatters';

	export let breadcrumbs;
	// https://tradingstrategy.ai/api/explorer/
	// See
	// https://datatables.net/reference/option/columns
	// https://datatables.net/reference/option/columns.render
	// https://datatables.net/reference/option/columns.type
	const columns = [
		{
			name: "Exchange",
			className: "col-exchange",
			data: "human_readable_name",

			render: function(data, type, row, meta) {
				return `<a href="/trading-view/${row.chain_slug}/${row.exchange_slug}">${row.human_readable_name}</a>`;
			}
		},
		{
			name: "Blockchain",
			data: "chain_name",
			className: "col-chain-name",
		},
		{
			name: "Trading pairs",
			data: "pair_count",
			className: "col-pair-count",
			type: "num",
			render: function(data, type, row, meta) {
				return formatAmount(data);
			}
		},
		{
			name: "Volume 30d (USD)",
			data: "usd_volume_30d",
			className: "col-volume",
			type: "num",
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
	<Breadcrumb breadcrumbs={breadcrumbs} />
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
