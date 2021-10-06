<script context="module">
    import { browser } from '$app/env';
    import { backendUrl } from '$lib/config';

    // Load and render exchange details on the server side
    // https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
    export async function load({ page }) {
        const exchange_slug = page.params.exchange_id;
        const chain_slug = page.params.chain;

        //const details = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        const encoded = new URLSearchParams({exchange_slug, chain_slug});
        const apiUrl = `${backendUrl}/exchange-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                return {
                    status: 404,
                    error: `Exchange not found: ${exchange_slug}`
                };
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

    export let exchange_slug;
    export let chain_slug;
    export let details;

    // const colums = ['Quote', 'Volume 24h', 'Liquidity', 'Price'];

	// https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
	// See https://datatables.net/reference/option/columns
	const columns = [
		{
			name: "Trading pair",
			className: "col-exchange",
			data: "pair_name",
			// https://datatables.net/reference/option/columns.render
			render: function(data, type, row, meta) {
                const chain = escapeHtml(row.chain_slug);
                const exchange = escapeHtml(row.exchange_slug);
                const pair = escapeHtml(row.pair_slug);
                const symbols = escapeHtml(row.pair_symbol);
				return `<a href="/${chain}/${exchange}/${pair}">${symbols}</a>`;
			}
		},

		{
			name: "Price (USD)",
			data: "usd_price_latest",
			className: "col-price",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatDollar(data);
			}
		},

		{
			name: "Price Δ",
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
			name: "Liq Δ",
			data: "liquidity_change_24h",
			className: "col-liquidity-change",
			type: "num", // https://datatables.net/reference/option/columns.type
			render: function(data, type, row, meta) {
				return formatPriceChange(data);
			}
		}
	];

    const options = {
        order: [[3, 'desc']],
		searching: false,
		serverSide: false,
		lengthChange: false,
        // https://tradingstrategy.ai/api/explorer/#/Pair/web_pairs
        ajax: {
            url: `${backendUrl}/pairs?chain_slugs=${chain_slug}&exchange_slugs=${exchange_slug}&direction=desc&sort=volume`,
            type: 'GET',
            dataSrc: function (pairResult) {
                // {total: 57476, pages: 575, results: Array(100)}
                console.log(pairResult);
                return pairResult.results;
            }
        }
    };

</script>

<svelte:head>
    <title>
        {details.human_readable_name} trading on {details.human_readable_name}
    </title>
    <meta
            name="description"
            content={'Decentralise exchange top trading pairs for' + details.human_readable_name}
    />
</svelte:head>

<div class="container">
    <div class="exchange-content">
        <h1>{details.human_readable_name} on {chain_slug}</h1>

        <h2>Trading Pairs</h2>
        <Datatable
                columns={columns}
                options={options}
                clickableRows={true}
                />
    </div>
</div>

<style>
    .exchange-content {
	    margin: 60px 0;
    }
</style>