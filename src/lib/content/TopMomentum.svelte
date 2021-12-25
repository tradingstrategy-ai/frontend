<script>
    /**
     * Top momentum information row for the front page.
     */


    import { formatPriceChange } from "$lib/helpers/formatters";
    import { determinePriceChangeClass } from "$lib/helpers/price";

    // As returned by https://tradingstrategy.ai/api/explorer/#/Trading%20signal/web_top_momentum
    export let momentumDetails;
    export let slots;

    /**
     * Make momentum slots human readable
     *
     * @param momentumDetails
     */
    function createSlots(momentumDetails) {

        if(!momentumDetails.top_liquidity_added_24h_min_liq_1m) {
            console.error("Bad momentum data", Object.keys(momentumDetails));
            throw new Error("Bad momentum data");
        }

        const pairsToShow = 5;

        return [
            {
                name: "Most profitable 24h",
                detail: "",
                pairs: momentumDetails.top_up_24h_min_liq_1m.slice(0, pairsToShow),
                link: "/trading-view/top-list/daily-up",
                linkName: "View all winning pairs"
            },

            {
                name: "Worst performance 24h",
                detail: "",
                pairs: momentumDetails.top_down_24h_min_liq_1m.slice(0, pairsToShow),
                link: "/trading-view/top-list/daily-down",
                linkName: "View all losing trading"
            }

            /*
            {
                name: "Liquidity increased 24h",
                detail: "Pairs with min. $1M liquidity",
                pairs: momentumDetails.top_liquidity_added_24h_min_liq_1m.slice(0, pairsToShow),
                indicator: "liquidity",
            }*/
        ]
    }

    $: slots = createSlots(momentumDetails);

</script>

<div class="top-momentum">
    <div class="row">
        {#each slots as slot}
            <div class="col-lg-6 col-md-6">
                <div class="card bg-primary shadow-soft border-light">
                    <div class="card-body">

                        <h5 class="h5 card-title">{ slot.name }</h5>

                        <p class="detail">
                            { slot.detail }
                        </p>

                        <table>
                            {#each slot.pairs as pair}
                                <tr>
                                    <td class="cell-pair-name ellipsis">
                                        <a href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}/${pair.pair_slug}`}>
                                            {pair.pair_symbol} on
                                            {pair.exchange_name}
                                        </a>
                                    </td>

                                    {#if slot.indicator === "liquidity" }
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
                        </table>

                        <a href={slot.link} class="btn btn-primary btn-block">
                            {slot.linkName}
                        </a>

                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>


    .detail, table {

    }

    .detail {
        color: --var(--gray-700);
    }

    td {
        white-space: nowrap;
        padding-bottom: 10px;
    }

    .cell-pair-name {
        width: 100%;
    }

    .ellipsis {
        position: relative;
    }
    .ellipsis:before {
        content: '&nbsp;';
        visibility: hidden;
    }
    .ellipsis a {
        position: absolute;
        left: 0;
        right: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>