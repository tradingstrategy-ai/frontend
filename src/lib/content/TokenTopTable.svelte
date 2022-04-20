<script>

    import { determinePriceChangeClass } from "$lib/helpers/price";
    import { formatPriceChange } from "$lib/helpers/formatters";

    // Tokens to render in this momentum table
    export let tokens;

    // Either "liquidity" or "price"
    export let topKind;
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
            {#each tokens as token, idx}
                <tr>

                    <td class="position">
                        #{idx + 1}
                    </td>

                    <td class="token-name">
                        <a href={`/trading-view/${token.chain_slug}/${token.exchange_slug}/${token.token}`}>
                            {token.token}
                        </a>
                    </td>

                    <td class="exchange">
                        <a href={`/trading-view/${token.chain_slug}/${token.exchange_slug}`}>
                            {token.exchange_name}
                        </a>
                    </td>

                    <td class="blockchain">
                        <a href={`/trading-view/${token.chain_slug}`}>
                            {token.chain_name}
                        </a>
                    </td>


                    {#if topKind === "liquidity" }
                        <td class={determinePriceChangeClass(token.liquidity_latest)}>
                            {formatPriceChange(token.liquidity_latest)}
                        </td>
                    {:else}
                        <td class={determinePriceChangeClass(token.volume_24h)}>
                            {formatPriceChange(token.volume_24h)}
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
