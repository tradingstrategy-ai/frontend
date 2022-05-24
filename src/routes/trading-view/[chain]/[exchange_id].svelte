<script context="module">
    /**
     * Exchange info page with all of its trading pairs.
     */

    import { backendUrl } from '$lib/config';
	import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";
    import {checkChainMaintenance} from "$lib/chain/maintenance";

    export async function load({ url, params, fetch }) {
        const exchange_slug = params.exchange_id;
        const chain_slug = params.chain;

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

        checkChainMaintenance(chain_slug, details.chain_name);

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
                breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
            }
        };
    }
</script>

<script>
    import {formatAmount, formatDollar, formatUnixTimestampAsDate} from "$lib/helpers/formatters";
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
    import PairExplorer from "$lib/explorer/PairExplorer.svelte";
    import StaleDataWarning from "$lib/chain/StaleDataWarning.svelte";
    import ExchangeInfoTable from "$lib/content/ExchangeInfoTable.svelte";
    import {parseExchangeName} from "$lib/helpers/exchange";

    export let exchange_slug;
    export let chain_slug;
    export let details;
    export let breadcrumbs;

    const nameDetails = parseExchangeName(details.human_readable_name);

</script>

<svelte:head>
    <title>
        {details.human_readable_name} on {details.chain_name}
    </title>
    <meta
            name="description"
            content={`Decentralise exchange ${details.human_readable_name} on ${details.chain_name} blockchain`}
    />
</svelte:head>

<div class="container">
	<Breadcrumb breadcrumbs={breadcrumbs} />
    <div class="exchange-content"  data-testid="statistics">

        <div class="row">
            <div class="col-md-12">
                <h1 id='title' data-testid="title">{details.human_readable_name} exchange on {details.chain_name}</h1>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-5">
                <ExchangeInfoTable {details} />
            </div>

            <div class="col-lg-7">
                <p>
                    <strong>{details.human_readable_name}</strong> is a decentralised exchange on  <a class=body-link href="/trading-view/{chain_slug}">{details.chain_name} blockchain</a>.
                </p>

                <p>
                    {details.human_readable_name} has 30 days trade volume of <strong>{formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}</strong>
                    and all-time volume of <strong>{formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}</strong>.
                    The first trade happened at <strong>{formatUnixTimestampAsDate(details.first_trade_at)}</strong>.
                </p>

                <p>
                    {details.human_readable_name} has <strong>{formatAmount(details.pair_count)}</strong> token trading pairs of which
                    <strong>{formatAmount(details.active_pair_count)}</strong> are
                    <a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/tracking.html">actively tracked</a> by Trading Strategy.
                </p>

                <p>
                    The factory smart contract address for {details.human_readable_name} is
                    <a class="body-link" href={details.blockchain_explorer_link}>{details.address}</a>.
                </p>

            </div>
        </div>

    <div class="row">
        <div class="col-md-12">
            <div class="exchange-actions">
                <a href={details.homepage} class="btn btn-primary">Visit {nameDetails.name}</a>
                <a href={details.blockchain_explorer_link} class="btn btn-primary">View {nameDetails.name} on blockchain explorer</a>
                <a href="/trading-view/{details.chain_slug}/{details.exchange_slug}/export-data" class="btn btn-primary">Download as Excel</a>
            </div>
        </div>
    </div>

        <div class="trading-pairs" data-testid="pairs">
            <h2>Trading Pairs</h2>

            <StaleDataWarning chainSlugs={[details.chain_slug]}/>

            <PairExplorer
                chainSlug={details.chain_slug}
                exchangeSlug={details.exchange_slug}
                enabledColumns={["pair_name", "usd_price_latest", "price_change_24h", "usd_volume_30d", "usd_liquidity_latest", "liquidity_change_24h",]}
                orderColumnIndex={3}
                />

            <p class="tracking-criteria">
                Not all trading pairs are being displayed or included in volume calculations.
                <a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/tracking.html">See inclusion criteria</a>.
            </p>
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

    .tracking-criteria {
        margin-top: 20px;
    }
</style>
