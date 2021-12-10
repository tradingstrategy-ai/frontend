<script>

    import '$lib/styles/price.css';
    import { determinePriceChangeClass } from "$lib/helpers/price";
    import { formatPriceChange } from "$lib/helpers/formatters";

    // Trading pairs to render in this momentum table
    export let pairs;

    // Either "liquidity" or "price"
    export let kind;
</script>

<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th></th>
                <th>Trading pair</th>
                <th class="exchange">Exchange</th>
                <th class="blockchain">Blockchain</th>
                <th>Price change</th>
            </tr>
        </thead>
        <tbody>
            {#each pairs as pair, idx}
                <tr>

                    <td class="position">
                        #{idx + 1}
                    </td>

                    <td class="pair-name">
                        <a href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}/${pair.pair_slug}`}>
                            {pair.pair_symbol}
                        </a>
                    </td>

                    <td class="exchange">
                        <a href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}`}>
                            {pair.exchange_name}
                        </a>
                    </td>

                    <td class="blockchain">
                        <a href={`/trading-view/${pair.chain_slug}`}>
                            {pair.chain_name}
                        </a>
                    </td>


                    {#if kind === "liquidity" }
                        <td class={determinePriceChangeClass(pair.liquidity_change_24h)}>
                            {formatPriceChange(pair.liquidity_change_24h)}
                        </td>
                    {:else}
                        <td class={determinePriceChangeClass(pair.price_change_24h)}>
                            {formatPriceChange(pair.price_change_24h)}
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    /* Remove less relevant columns on mobile */
    /* --breakpoint-md */
    @media(max-width: 992px) {
        .exchange, .blockchain {
            display: none;
        }
    }
</style>