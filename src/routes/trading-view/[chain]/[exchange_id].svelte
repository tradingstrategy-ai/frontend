<script context="module">
    import { browser } from '$app/env';
    import { backendUrl } from '$lib/config';
	import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

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

        // console.log("Details", details);

        const readableNames = {
            ...breadcrumbTranslations,
            [exchange_slug]: details.human_readable_name
        };

        //console.log("Received exchange details", details);

        return {
            props: {
                exchange_slug,
                chain_slug,
                details,
                backendUrl,
                breadcrumbs: buildBreadcrumbs(page.path, readableNames)
            }
        };
    }
</script>

<script>
    import { formatDollar  } from "$lib/helpers/formatters";
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
    import PairExplorer from "$lib/explorer/PairExplorer.svelte";
    import StaleDataWarning from "$lib/chain/StaleDataWarning.svelte";

    export let exchange_slug;
    export let chain_slug;
    export let details;
    export let breadcrumbs;

    const chainName = details.chain_name;

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
	<Breadcrumb breadcrumbs={breadcrumbs} />
    <div class="exchange-content">
        <h1 id='title' data-test-id="title">{details.human_readable_name} exchange on {chainName}</h1>

        <div class="statistics" data-test-id="statistics">
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
                    <table class="table table-summary table-summary-all-time" data-test-id="pairs">

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

            <StaleDataWarning chainSlugs={[details.chain_slug]}/>

            <PairExplorer
                exchangeSlug={details.exchange_slug}
                enabledColumns={["pair_name", "usd_price_latest", "price_change_24h", "usd_volume_30d", "usd_liquidity_latest", "liquidity_change_24h",]}
                orderColumnIndex={3}
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