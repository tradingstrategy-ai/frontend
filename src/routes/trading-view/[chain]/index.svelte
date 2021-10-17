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
    import HappyDatetime from '$lib/content/HappyDatetime.svelte';
    import { formatAmount, formatUrlAsDomain } from '$lib/helpers/formatters';

    export let details;
    export let breadcrumbs;

</script>

<svelte:head>
    <title>{details.chain_name} decentralised exchanges and trades</title>
    <meta name="description" content={`${details.chain_slug} available aexchanges and trading pairs`}>
</svelte:head>

<div class="container">

    <Breadcrumb breadcrumbs={breadcrumbs} />

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
                    Trading pairs
                    <p class="hint">Supported trading pairs on Trading Strategy</p>
                </th>
                <td>{formatAmount(details.pairs)}</td>
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


        </table>

    </div>
</div>


<style>

    h1 {
        margin: 20px 0;
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
</style>
