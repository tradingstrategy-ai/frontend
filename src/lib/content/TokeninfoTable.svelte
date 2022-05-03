<script>
    import { formatDollar } from "$lib/helpers/formatters";
    export let summary;

</script>

<table class="table">
    <tr>
        <th>Name</th>
        <td>{summary.name}</td>
    </tr>
    <tr>
        <th>Token symbol</th>
        <td>{summary.symbol}</td>
    </tr>
    <tr>
        <th>Total Supply</th>
        <td>{summary.total_supply} {summary.symbol}</td>
    </tr>
    <tr>
        <th>Standard</th>
        <td>ERC-20 token</td>
    </tr>
    <tr>
        <th>Available liquidity</th>
        <td>{formatDollar(summary.liquidity_latest)}</td>
    </tr>
    <tr>
        <th>Volume 24h</th>
        <td>{formatDollar(summary.volume_24h)}</td>
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
        table th, table td {
            border-bottom: 1px solid #ccbeb3;
        }
    }

    a {
        border-bottom: 1px solid var(--link-underline);
    }

    a:hover {
        color: var(--link-underline);
    }

</style>
