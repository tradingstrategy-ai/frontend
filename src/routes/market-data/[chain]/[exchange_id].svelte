<script context="module">
    import { browser } from '$app/env';
    import { backendUrl } from '$lib/config';

    // Load and render exchange details on the server side
    // https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
    export async function load({ page, fetch }) {
        const exchange_slug = page.params.exchange_id;
        const chain_slug = page.params.chain;

        //const details = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        const encoded = new URLSearchParams({exchange_slug, chain_slug});
        const apiUrl = `${backendUrl}/exchange-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                return;
                //return {
                //    status: 404,
                //    error: `Exchange not found: ${exchange_slug}`
                //};
            } else {
                console.error(resp);
                return {
                    status: resp.status,
                    error: new Error(
                        `Could not load data for the exchange details: ${apiUrl}. See console for details.`
                    )
                };
            }
        }

        const details = await resp.json();

        console.log("Received exchange details", details);

        return {
            props: {
                exchange_slug,
                chain_slug,
                details,
                backendUrl,
            }
        };
    }
</script>

<script>
    import Datatable from '$lib/datatable/datatable.svelte';
    import { formatDollar, formatPriceChange } from "$lib/helpers/formatters";
    import { escapeHtml } from "$lib/helpers/html";
    import jQuery from 'jquery';

    export let exchange_slug;
    export let chain_slug;
    export let details;

    // Currently server-side supports the following sort options: volume, liquidity, price change
	// https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
	// See https://datatables.net/reference/option/columns
	const columns = [
		{
			name: "Trading pair",
			className: "col-exchange",
			data: "pair_name",
            orderable: false,
			// https://datatables.net/reference/option/columns.render
			render: function(data, type, row, meta) {
                const chain = escapeHtml(row.chain_slug);
                const exchange = escapeHtml(row.exchange_slug);
                const pair = escapeHtml(row.pair_slug);
                const symbols = escapeHtml(row.pair_symbol);
				return `<a href="/market-data/${chain}/${exchange}/${pair}">${symbols}</a>`;
			}
		},

		{
			name: "Price (USD)",
            orderable: false,
			data: "usd_price_latest",
			className: "col-price",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatDollar(data);
			}
		},

		{
			name: "Price 24h Δ",
			data: "price_change_24h",
			className: "col-price-change",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatPriceChange(data);
			}
		},

		{
			name: "Volume 24h (USD)",
			data: "usd_volume_24h",
			className: "col-volume",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatDollar(data);
			}
		},

		{
			name: "Liquidity (USD)",
			data: "usd_liquidity_latest",
			className: "col-liquidity",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatDollar(data);
			}
		},

		{
			name: "Liq 24h Δ",
            orderable: false,
			data: "liquidity_change_24h",
			className: "col-liquidity-change",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatPriceChange(data);
			}
		}
	];

    const options = {
        order: [[3, 'desc']], // Default sorting is liquidity desc
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

        ajax: async function(data, callback, settings) {
            // https://datatables.net/reference/option/ajax
            console.log("AJAX", data, callback, settings);

            // Match column id to a sort key
            let sortKey = null;
            switch(data.order[0].column) {
                case 3:
                    sortKey = "volume";
                    break;
                case 2:
                    sortKey = "price_change";
                    break;
                case 4:
                    sortKey = "liquidity";
                    break;
                default:
                    // Server-side sorting not supported for this column at the moment
                    sortKey = null;
            }

            // https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
            const params = {
                chain_slugs: chain_slug,
                exchange_slugs: exchange_slug,
            }

            // TODO: Add paging to the server query parameters

            // Add sorting parameters if supported
            if(sortKey) {
                params.direction = data.order[0].dir === "desc" ? "desc" : "asc";
                params.sort = sortKey;
            }
            const encoded = new URLSearchParams(params);
            const resp = await fetch(`${backendUrl}/pairs?${encoded}`);

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

            // Result object is
            // {total: 57483, pages: 575, results: Array(100)
            const result = await resp.json();

            // Mangle the result object for Datatables format
            result.recordsTotal = result.total;
            result.recordsFiltered = result.total;
            result.data = result.results;

            console.log("Rendering", result.data);

            callback(result);
        }
    };

    // TODO: make this information to come from server-side
    const chainName = chain_slug.charAt(0).toUpperCase() + chain_slug.slice(1);

</script>

<svelte:head>
    <title>
        {details.human_readable_name} exchange on {chainName}
    </title>
    <meta
            name="description"
            content={'Decentralise exchange top trading pairs for' + chainName}
    />
</svelte:head>

<div class="container">
    <div class="exchange-content">
        <h1>{details.human_readable_name} on {chainName}</h1>

        <div class="statistics">
            <h2>Statistics</h2>
            <!-- See ExchangeDetails at https://tradingstrategy.ai/api/explorer -->
            <div class="row">
                <div class="col-md-6">
                    <table class="table table-summary table-summary-30d">
                        <tr>
                            <th></th>
                            <td>
                                <strong>Last 30 days</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>Buy volume</th>
                            <td>
                                {formatDollar(details.buy_volume_30d || 0)}
                            </td>
                        </tr>

                        <tr>
                            <th>Sell volume</th>
                            <td>
                                {formatDollar(details.sell_volume_30d || 0)}
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="col-md-6">
                    <table class="table table-summary table-summary-all-time">

                        <tr>
                            <th></th>
                            <td>
                                <strong>All time</strong>
                            </td>
                        </tr>

                        <tr>
                            <th>Buy volume</th>
                            <td>
                                {formatDollar(details.buy_volume_all_time || 0)}
                            </td>
                        </tr>

                        <tr>
                            <th>Sell volume</th>
                            <td>
                                {formatDollar(details.sell_volume_all_time || 0)}
                            </td>
                        </tr>
                    </table>

                </div>

            </div>
        </div>

        <div class="trading-pairs">
            <h2>Trading Pairs</h2>
            <p>Click trading pairs to open price chart.</p>
            <Datatable
                columns={columns}
                options={options}
                clickableRows={true}
                />
        </div>
    </div>
</div>

<style>
    .exchange-content, .statistics, .trading-pairs {
	    margin: 60px 0;
    }

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