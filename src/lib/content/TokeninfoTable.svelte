<script>
    export let summary;
</script>

<table class="table">
    <tr>
        <th>Name</th>
        <td>{summary.name}</td>
    </tr>
    <tr>
        <th>Symbol</th>
        <td>{summary.symbol}</td>
    </tr>
    <tr>
        <th>Total Supply</th>
        <td>{summary.total_supply}</td>
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
