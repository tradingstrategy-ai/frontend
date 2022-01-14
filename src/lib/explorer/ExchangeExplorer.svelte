<script>
    /**
     * Explore exchanges  that match certain filter criteria.
     *
     * Sorting, etc. is done on the client side, as the number of exchanges should be < 2000.
     */

    import Datatable from '$lib/datatable/datatable.svelte';

    import { backendUrl } from '$lib/config';
	import { formatDollar, formatAmount } from '$lib/helpers/formatters';

    // The chain slug for which the exchanges pairs are rendered like ["binance"]
    export let chainSlug = null;

    // What columns we will show in the explorer.
    // See allColumns for options.
    export let enabledColumns = ["human_readable_name", "pair_count", "usd_volume_30d"];

    export let orderColumnIndex = 2;

    export let orderColumnDirection = "desc";

    export let filterJunk = true;

	// https://tradingstrategy.ai/api/explorer/
	// See
	// https://datatables.net/reference/option/columns
	// https://datatables.net/reference/option/columns.render
	// https://datatables.net/reference/option/columns.type
	const availableColumns = {
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
			render: function(data, type, row, meta) {
				return `<a href="/trading-view/${row.chain_slug}">${row.chain_name}</a>`;
			}
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
        const column = availableColumns[columnName];
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
        scrollX: false,

        /**
         *
         * AJAX data fetch hook for Datatables
         *
         * https://datatables.net/reference/option/ajax
         *
         * @param data See https://datatables.net/manual/server-side
         * @param callback When the data has been obtained from the data source, the second parameter (callback here) should be called with a single parameter passed in - the data to use to draw the table.
         * @param settings Setting for the table: https://datatables.net/reference/type/DataTables.Settings
         */
        ajax: async function(data, callback, settings) {

            const params = {};

            if(filterJunk) {
                params.filter_zero_volume = "true";
            }

            if(chainSlug) {
                params.chain_slug = chainSlug;
            }

            // https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
            const encoded = new URLSearchParams(params);
            const url = `${backendUrl}/exchanges?${encoded}`;
            console.log("Reading pair data from", url);
            const resp = await fetch(url);

            if (!resp.ok) {

                // Decode 422 invalid input parameter error from the server
                // with JSON payload
                let errorDetails;
                try {
                    // GenericErrorModel in OpenAPI
                    errorDetails = await resp.json()
                    callback({"error": errorDetails.message});
                } catch(e) {
                }

                console.log("API error:", resp, "error details:", errorDetails);
                return;
            }

            const result = await resp.json();
            console.log("Got exchange result", result);

            // TODO: Maybe add pagination on one day
            // Mangle the result object for Datatables format
            result.recordsTotal = result.exchanges.length;
            result.recordsFiltered = result.exchanges.length;
            result.data = result.exchanges;

            callback(result);
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

    /* It's getting narrow so let's make some room by decreasing font size from the default 1rem*/
    .exchanges :global(.datatables-wrapper)  {
        font-size: 0.8rem;
    }

    /* Fix sorting icon position after making the font smaller */
    .exchanges :global(.sorting::before) {
        bottom: 1.3em;
    }

    .exchanges :global(.sorting::after) {
        bottom: 1.3em;
    }

</style>