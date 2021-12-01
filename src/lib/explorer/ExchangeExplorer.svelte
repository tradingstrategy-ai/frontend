<script>
    /**
     * Explore trading pairs that match certain filter criteria.
     */

    import Datatable from '$lib/datatable/datatable.svelte';

    import { backendUrl } from '$lib/config';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';

    // The chain slug for which the exchanges pairs are rendered like ["binance"]
    export let chainSlugs = [];

    // What columns we will show in the explorer.
    // See allColumns for options.
    export let enabledColumns = ["human_readable_name", "usd_volume_30d"];

    export let orderColumnIndex = 3;

    export let orderColumnDirection = "desc";

    export let pageSize = 20;

	// https://tradingstrategy.ai/api/explorer/
	// See
	// https://datatables.net/reference/option/columns
	// https://datatables.net/reference/option/columns.render
	// https://datatables.net/reference/option/columns.type
	const availableColums = {
		"human_readable_name": {
			name: "Exchange",
			className: "col-exchange",
			data: "human_readable_name",

			render: function(data, type, row, meta) {
				return `<a href="/trading-view/${row.chain_slug}/${row.exchange_slug}">${row.human_readable_name}</a>`;
			}
		},
		"chain_name": {
			name: "Blockchain",
			data: "chain_name",
			className: "col-chain-name",
		},
		"pair_count": {
			name: "Trading pairs",
			data: "pair_count",
			className: "col-pair-count",
			type: "num-fmt",
			render: function(data, type, row, meta) {
				return formatAmount(data);
			}
		},
		"usd_volume_30d": {
			name: "Volume 30d (USD)",
			data: "usd_volume_30d",
			className: "col-volume",
			type: "num-fmt",
			render: function(data, type, row, meta) {
				return formatDollar(data);
			}
		}
    }

    // Build columns based on the component arguments
    const columns = [];
    for(const columnName of enabledColumns) {
        const column = availableColums[columnName];
        if(!column) {
            throw new Error(`Unknown column: ${columnName}`);
        }
        columns.push(column);
    }

	const options = {
	    order: [[ orderColumnIndex, orderColumnDirection ]],
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

<div class="exchanges">
    <Datatable
        columns={columns}
        options={options}
        clickableRows={true}
        />
</div>

<style>
</style>