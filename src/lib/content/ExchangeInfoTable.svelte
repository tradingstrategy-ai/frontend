<script>
    /**
     * Render exchange summary table on exchange page.
     */

    import { formatDollar } from '$lib/helpers/formatters';
    import {parseExchangeName} from "$lib/helpers/exchange";

    export let details;

    const nameDetails = parseExchangeName(details.human_readable_name);

</script>

<table class="table">

    <tr>
        <th>Name</th>
        <td>{nameDetails.name}</td>
    </tr>

    <tr>
        <th>Volume 30d</th>
        <td>{formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}</td>
    </tr>

    <tr>
        <th>Volume all-time</th>
        <td>{formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}</td>
    </tr>

    {#if nameDetails.version != 1 }
        <tr>
            <th>Version</th>
            <td>{nameDetails.version}</td>
        </tr>
    {/if}

    <tr>
        <th>Type</th>
        <td>Uniswap v2 like</td>
    </tr>

    <tr>
        <th>Blockchain</th>
        <td>
            <a href="/trading-view/{details.chain_slug}">{details.chain_name}</a>
        </td>
    </tr>

</table>

<style>

    table {
        font-size: 1rem;
    }

    table td, table th {
        padding: 0.25rem;
        border: 0;
    }

    /* --breakpoint-md */
    @media(max-width: 992px) {
        /* On mobile, don't render headings too wide */
        table th {
            width: 30%;
        }
    }

    a {
        border-bottom: 1px solid var(--link-underline);
    }

    a:hover {
        color: var(--link-underline);
    }


</style>