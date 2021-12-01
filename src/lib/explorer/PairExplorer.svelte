<script>
    /**
     * Explore trading pairs that match certain filter criteria.
     */

    import jQuery from 'jquery';
    import Datatable from '$lib/datatable/datatable.svelte';

    import { formatDollar, formatPriceChange } from "$lib/helpers/formatters";
    import { escapeHtml } from "$lib/helpers/html";
    import { backendUrl } from '$lib/config';

    // The exchange slug for which the trading pairs are render, like "sushiswap"
    // Optional.
    export let exchangeSlug = null;

    // The chain slug for which the trading pairs are rendered like "binance"
    export let chainSlug = null;

    // What columns we will show in the explorer.
    // See allColumns for options.
    export let enabledColumns = ["pair_name", "usd_price_latest"];

    export let orderColumnIndex = 3;

    export let orderColumnDirection = "desc";

    // Currently server-side supports the following sort options: volume, liquidity, price change
	// https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
	// See https://datatables.net/reference/option/columns

    // All possible configurable columns.
    // These match what data is available from the backend.
    const allColumns = {
        "pair_name": {
            name: "Trading pair",
            className: "col-pair",
            data: "pair_name",
            serverSideSortKey: null,
            orderable: false,
            // https://datatables.net/reference/option/columns.render
            render: function (data, type, row, meta) {
                const chain = escapeHtml(row.chain_slug);
                const exchange = escapeHtml(row.exchange_slug);
                const pair = escapeHtml(row.pair_slug);
                const symbols = escapeHtml(row.pair_symbol);
                return `<a href="/trading-view/${chain}/${exchange}/${pair}">${symbols}</a>`;
            }
        },

        "exchange_name": {
            name: "Exchange",
            className: "col-exchange",
            data: "exchange_name",
            serverSideSortKey: null,
            orderable: false,
            // https://datatables.net/reference/option/columns.render
            render: function (data, type, row, meta) {
                const chain = escapeHtml(row.chain_slug);
                const exchange_slug = escapeHtml(row.exchange_slug);
                const exchange_name = escapeHtml(row.exchange_name);
                return `<a href="/trading-view/${chain}/${exchange_slug}/">${exchange_name}</a>`;
            }
        },


        "usd_price_latest": {
            name: "Price (USD)",
            orderable: false,
            data: "usd_price_latest",
            serverSideSortKey: null,
            className: "col-price",
            type: "num", // https://datatables.net/reference/option/columns.type
            render: function (data, type, row, meta) {
                return formatDollar(data);
            }
        },

        "price_change_24h": {
            name: "Price 24h Δ",
            data: "price_change_24h",
            serverSideSortKey: "price_change_24h",
            className: "col-price-change",
            type: "num", // https://datatables.net/reference/option/columns.type
            render: function (data, type, row, meta) {
                return formatPriceChange(data);
            }
        },

        "usd_volume_24h": {
            name: "Volume 24h (USD)",
            data: "usd_volume_24h",
            className: "col-volume",
            serverSideSortKey: "volume_1d",
            type: "num", // https://datatables.net/reference/option/columns.type
            render: function (data, type, row, meta) {
                return formatDollar(data);
            }
        },

        "usd_volume_30d": {
            name: "Volume 30d (USD)",
            data: "usd_volume_30d",
            className: "col-volume",
            serverSideSortKey: "volume_30d",
            type: "num", // https://datatables.net/reference/option/columns.type
            render: function (data, type, row, meta) {
                return formatDollar(data);
            }
        },

        "usd_liquidity_latest": {
            name: "Liquidity (USD)",
            data: "usd_liquidity_latest",
            serverSideSortKey: "liquidity",
            className: "col-liquidity",
            type: "num", // https://datatables.net/reference/option/columns.type
            render: function (data, type, row, meta) {
                return formatDollar(data);
            }
        },

        "liquidity_change_24h": {
            name: "Liq 24h Δ",
            orderable: false,
            data: "liquidity_change_24h",
            className: "col-liquidity-change",
            type: "num", // https://datatables.net/reference/option/columns.type
            render: function (data, type, row, meta) {
                return formatPriceChange(data);
            }
        }
    }

    // Build columns based on the component arguments
    const columns = [];
    for(const columnName of enabledColumns) {
        const column = allColumns[columnName];
        if(!column) {
            throw new Error(`Unknown column: ${columnName}`);
        }
        columns.push(column);
    }

    const options = {
        order: [[orderColumnIndex, orderColumnDirection]], // Default sorting is liquidity desc
		searching: false,
		serverSide: true,
		lengthChange: false,

        // Add DataTable.createRow callback to style rows
        // https://datatables.net/reference/option/createdRow
        createdRow: function(row, data, dataIndex) {

            const priceChange = data.price_change_24h;
            let priceChangeClass = "price-change-black";

            if(priceChange > 0) {
                priceChangeClass = "price-change-green";
            } else if(priceChange < 0) {
                priceChangeClass = "price-change-red";
            }

            jQuery(row).find(".col-price-change").addClass(priceChangeClass);

            const liqChange = data.liquidity_change_24h;
            let liqChangeClass = "price-change-black";

            if(liqChange > 0) {
                liqChangeClass = "price-change-green";
            } else if(liqChange < 0) {
                liqChangeClass = "price-change-red";
            }

            jQuery(row).find(".col-liquidity-change").addClass(liqChangeClass);
        },


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

            // console.log("AJAX", data, callback, settings);

            // Match column index given by DataTables to the server-side sort key

            const sortColumnIndex = data.order[0].column;
            let sortKey = columns[sortColumnIndex].serverSideSortKey;

            if(!sortKey) {
                throw new Error(`Column does not support sorting: ${sortColumnIndex}`)
            }

            const params = {
                // https://datatables.net/manual/server-side
                page_size: data.length,
                // Zero-based rendered page
                page: data.start,
            };

            if(chainSlug) {
                params.chain_slugs = chainSlug;
            }

            if(exchangeSlug) {
                params.exchange_slugs = exchangeSlug;
            }

            // Add sorting parameters if supported
            if(sortKey) {
                params.direction = data.order[0].dir === "desc" ? "desc" : "asc";
                params.sort = sortKey;
            }

            // https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
            const encoded = new URLSearchParams(params);
            const url = `${backendUrl}/pairs?${encoded}`;
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

                console.error("API error:", resp, "error details:", errorDetails);
                return;
            }

            // Result object is
            // {total: 57483, pages: 575, results: Array(100)
            const result = await resp.json();

            // Mangle the result object for Datatables format
            result.recordsTotal = result.total;
            result.recordsFiltered = result.total;
            result.data = result.results;

            // console.log("Rendering", result.data);

            callback(result);
        }
    };


</script>

<div class="trading-pairs">
    <Datatable
        columns={columns}
        options={options}
        clickableRows={true}
        />
</div>

<style>

    /* Make sure columns do not wiggle when resorting and the data in the cells change */
    .trading-pairs  :global(td)  {
        width: 17%; /* 1/6 */
    }

    .trading-pairs  :global(.price-change-green)  {
        color: #458b00;
    }

    .trading-pairs  :global(.price-change-red)  {
        color: #cc0000;
    }

</style>