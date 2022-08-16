<!--
@component
Stale data warning

Show a warning if any specific chains we have lagging or stale data.

Gets list of chain slugs for which we display data and check if any of those
slugs are on the red list.
-->
<script>
    // List of chain slugs we give a warning for
    // See config.ts for details
    export const chainSlugs = Object.keys(config.chainsBadData);

    // Set to true to display a warning if any of the blockchain sources is having an issue
    export const allChains = false;
</script>

{#if chainSlugs.includes("polygon") || allChains }
    <div class="alert alert-danger">
        <a href="/trading-view/polygon">Polygon blockchain</a> data is being processed at the moment.
        Real-time and historical prices may not be available at the moment.
    </div>
{/if}

<style>
    .alert-danger a {
        color: #a91e2c;
    }
</style>
