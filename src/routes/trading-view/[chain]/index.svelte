<script context="module">

    import { backendUrl } from '$lib/config';
	import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    /**
     * Display chain information and indexing status
     */

    export async function load({ page, fetch }) {
        const chain_slug = page.params.chain;

        // Load and render exchange details on the server side
        // https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
        const encoded = new URLSearchParams({chain_slug});
        const apiUrl = `${backendUrl}/chain-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                console.error("Not found", resp.status);
                return;
            } else {
                console.error(resp);
                return {
                    status: resp.status,
                    error: new Error(
                        `Could not load data for the chain details: ${apiUrl}. See console for details.`
                    )
                };
            }
        }

        const details = await resp.json();
        const slug = details.chain_slug;

        const readableNames = {
            "trading-view": "Trading data",
        };
        readableNames[slug] = details.chain_name;

        // console.log("Received chain details", details);

        return {
            props: {
                details,
                breadcrumbs: buildBreadcrumbs(page.path, readableNames)
            }
        };
    }
</script>

<script>
    import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
    import { formatAmount, formatUrlAsDomain } from '$lib/helpers/formatters';
    import PairExplorer from "$lib/explorer/PairExplorer.svelte";
    import StaleDataWarning from "$lib/chain/StaleDataWarning.svelte";
    import ExchangeExplorer from "$lib/explorer/ExchangeExplorer.svelte";

    export let details;
    export let breadcrumbs;

</script>

<svelte:head>
    <title>{details.chain_name} decentralised exchanges and trading pairs</title>
    <meta name="description" content={`${details.chain_name} market data and token prices`}>
</svelte:head>

<div class="container">

    <Breadcrumb breadcrumbs={breadcrumbs}  />

    <div class="exchange-content">
        <h1>
            <img alt={`${details.chain_name} logo`} class="chain-logo" src={details.chain_logo} />
            {details.chain_name} blockchain
        </h1>

        <p>

        </p>

        <table class="table">

            <tr>
                <th>Blockchain website</th>
                <td>
                    <a class="homepage" href={details.homepage}>
                        {formatUrlAsDomain(details.homepage)}
                    </a>
                </td>
            </tr>

            <tr>
                <th>
                    Exchanges
                    <p class="hint">Supported exchanges on Trading Strategy</p>
                </th>
                <td>{details.exchanges}</td>
            </tr>

            <tr>
                <th>
                    Untracked trading pairs
                    <p class="hint">
                        Not all trading pairs are being tracked.
                        <a rel="external" href="https://tradingstrategy.ai/docs/programming/tracking.html">See the inclusion criteria.</a>
                    </p>
                </th>
                <td>-</td>
            </tr>

            <tr>
                <th>
                    Tracked trading pairs
                    <p class="hint">Total trading pairs on Trading Strategy for this blockchain.</p>
                </th>
                <td>{formatAmount(details.pairs)}</td>
            </tr>

            <tr>
                <th>
                    Active trading pairs
                    <p class="hint">
                        Trading pairs with market data feeds.
                        Active trading pairs have enough trading activity to have data feeds generated for them.
                    </p>
                </th>
                <td>{formatAmount(details.tracked_pairs)}</td>
            </tr>

            <tr>
                <th>
                    First indexed block
                    <p class="hint">Starting block when Trading Strategy started collect data</p>
                </th>
                <td>{formatAmount(details.start_block)}</td>
            </tr>

            <tr>
                <th>
                    Last indexed block
                    <p class="hint">Currently seen last block with available trading data</p>
                </th>
                <td>{formatAmount(details.end_block)}</td>
            </tr>

            <!--
            <tr>
                <th>
                    First indexed trade
                    <p class="hint">When the first trade was detected on this chain</p>
                </th>
                <td>
                    <HappyDatetime when={details.first_swap_at} />
                </td>
            </tr>

            <tr>
                <th>
                    Last indexed trade
                    <p class="hint">Last trade seen on this chain</p>
                </th>
                <td>
                    <HappyDatetime when={details.last_swap_at} />
                </td>
            </tr>
            -->


        </table>

    </div>

    <div class="exchange-explorer-wrapper">
        <h2>Exchanges on {details.chain_name}</h2>

        <StaleDataWarning chainSlugs={[details.chain_slug]}/>

        <p>Showing exchanges with trading activity in last 30 days.</p>

        <ExchangeExplorer
            chainSlug={details.chain_slug}
            enabledColums={["human_readable_name", "pair_count", "usd_volume_30d"]}
            orderColumnIndex={2}
            />
    </div>

    <div class="pair-explorer-wrapper">
        <h2>Trading pairs on {details.chain_name}</h2>

        <StaleDataWarning chainSlugs={[details.chain_slug]}/>

        <PairExplorer
            chainSlug={details.chain_slug}
            enabledColumns={["pair_name", "exchange_name", "usd_price_latest", "usd_volume_30d", "usd_liquidity_latest"]}
            orderColumnIndex={3}
            />
    </div>
</div>


<style>

    h1 {
        margin: 20px 0;
    }

    .exchange-explorer-wrapper,
    .pair-explorer-wrapper {
        margin: 60px 0;
    }

	.chain-logo {
		max-width: 48px;
		max-height: 48px;
	}

    .homepage {
        text-decoration: underline;
    }

    .hint {
        color: var(--gray-800);
        font-size: 75%;
    }

    .pair-explorer-wrapper {
        margin-bottom: 60px;
    }
</style>
