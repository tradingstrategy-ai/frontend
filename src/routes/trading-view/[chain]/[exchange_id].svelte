<script context="module">
    /**
     * Exchange info page with all of its trading pairs.
     */

    import { backendUrl } from '$lib/config';
	import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    export async function load({ page, fetch }) {
        const exchange_slug = page.params.exchange_id;
        const chain_slug = page.params.chain;

        // Load and render exchange details on the server side
        // https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
        const encoded = new URLSearchParams({exchange_slug, chain_slug});
        const apiUrl = `${backendUrl}/exchange-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                // TODO: Might happen if the sitemap is out of sync
                return;
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

        const readableNames = {
            ...breadcrumbTranslations,
            [exchange_slug]: details.human_readable_name
        };

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
    import ExchangeInfoTable from "$lib/content/ExchangeInfoTable.svelte";

    export let exchange_slug;
    export let chain_slug;
    export let details;
    export let breadcrumbs;

</script>

<svelte:head>
    <title>
        {details.human_readable_name} on {details.chain_name}
    </title>
    <meta
            name="description"
            content={`Decentralise exchange ${details.chain_name} on ${details.chain_name} blockchain`}
    />
</svelte:head>

<div class="container">
	<Breadcrumb breadcrumbs={breadcrumbs} />
    <div class="exchange-content">

        <div class="row">
            <div class="col-md-12">
                <h1 id='title' data-test-id="title">{details.human_readable_name} exchange on {details.chain_name}</h1>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-4">
                <ExchangeInfoTable {details} />
            </div>

            <div class="col-lg-8">
                <p>
                    <strong>{details.human_readable_name}</strong> is a decentralised exchange on  <a class=body-link href="/trading-view/{chain_slug}">{details.chain_name} blockchain</a>.
                </p>

                <p>
                    {details.human_readable_name} has 30 days trade volume of <strong>{formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}</strong>
                    and all-time volume of <strong>{formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}</strong>.
                </p>


            </div>
        </div>

    <div class="row">
        <div class="col-md-12">
            <div class="exchange-actions">
                <a href="/trading-view/{chain_slug}" class="btn btn-primary">View exchanges on {details.chain_name}</a>
                <a href="/trading-view/exchanges" class="btn btn-primary">View all exchanges</a>
            </div>
        </div>
    </div>

        <div class="trading-pairs">
            <h2>Trading Pairs</h2>

            <StaleDataWarning chainSlugs={[details.chain_slug]}/>

            <PairExplorer
                chainSlug={details.chain_slug}
                exchangeSlug={details.exchange_slug}
                enabledColumns={["pair_name", "usd_price_latest", "price_change_24h", "usd_volume_30d", "usd_liquidity_latest", "liquidity_change_24h",]}
                orderColumnIndex={3}
                />
        </div>
    </div>
</div>

<style>
    .trading-pairs {
	    margin-bottom: 60px;
    }

    /* Make sure columns do not wiggle when resorting and the data in the cells change */
    .trading-pairs  :global(td)  {
        width: 17%; /* 1/6 */
    }

    .exchange-actions .btn {
        margin: 20px 20px 20px 0;
    }

</style>