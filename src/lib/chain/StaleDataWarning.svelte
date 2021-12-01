<script>
    /**
     * Show a warning if any specific chains we have lagging or stale data.
     *
     * Gets list of chain slugs for which we display data and check if any of those
     * slugs are on the red list.
     */

    // List of chain slugs we give a warning for
    export let chainSlugs = [];

    export let allChains = false;


</script>

<!-- A placeholder until we get this information from the SSR hook -->
{#if chainSlugs.includes("binance") || allChains }
    <div class="alert alert-danger">
        <a href="/trading-view/binance">Binance Smart Chain</a> data is lagging. Real-time prices and price changes may not be available at the moment.
    </div>
{/if}

<style>
    .alert-danger a {
        color: #a91e2c;
    }
</style>