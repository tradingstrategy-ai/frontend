<script>


    import { formatDollar } from '$lib/helpers/formatters';
    import { formatPriceChange } from '$lib/helpers/formatters';


    export let summary;
    /**
     * Reverse-calculate raw price using the US/quota token exchange rate
     */
    function calculateTokenPrice() {
        if(!summary.exchange_rate) {
            return null;
        }

        const tokenPrice = summary.usd_price_latest / summary.exchange_rate;
        return tokenPrice;
    }

    let tokenPrice = calculateTokenPrice();

    $: priceChangeColorClass = summary.price_change_24h >= 0 ? "price-change-green" : "price-change-red";
</script>

<table class="table">
    <tr>
        <th>Symbol</th>
        <td>{summary.symbol}</td>
    </tr>
    <tr>
        <th>Total Supply</th>
        <td>{summary.total_supply}</td>
    </tr>
    <tr>
    <th>Token Price</th>
        <td>
            <strong class="{priceChangeColorClass}">
                { formatDollar(summary.usd_price_latest, 3, 3, "") } USD
            </strong>
        </td>
    </tr>
    <tr>
        <th>Liquidity</th>
        <td>
            {formatDollar(summary.usd_liquidity_latest)}
        </td>
    </tr>

    <tr>
        <th>Volume 24h</th>
        <td>
            <strong class="{priceChangeColorClass}">
                { formatPriceChange(summary.price_change_24h || 0 ) }
            </strong>
        </td>
    </tr>

    <tr>
        <th>Trading pair</th>
        <td>{summary.tradingPairs || 0 }</td>
    </tr>

    <tr>
        <th>Market cap</th>
        <td>{summary.maketCap || 0}</td>
    </tr>

    <tr>
        <th>Address</th>
        <td>
            <a href="/trading-view/{summary.address}">{'0x0...'}</a>
        </td>
    </tr>

    <tr>
        <th>Blockchain</th>
        <td>
            <a href="/trading-view/{summary.blockchain || 'ethereum' }"></a>
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
