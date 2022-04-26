<!--
@component

Render export page for a trading pair list.
-->

<script lang="ts">

    // Our API URL that does exporting
    export let backendUrl;

    // Chain wher exchange is
    export let chain_slug;

    // Exchange id
    export let exchange_slug;

    // Exchange name
    export let exchange_name;

    // Download customization
    export let selectedFormat="excel",
        selectedDataset="top_3000_rows",
        selectedSort="price_change_24h",
        selectedFilter="min_liquidity_1M";

    export let link;

    export let downloadDisabled = false;

    function handleDownloadClick() {
        downloadDisabled = true;
    }

    $: {
        // See https://tradingstrategy.ai/api/explorer/#/Trading%20pair/web_pairs
        console.log(selectedFormat);
        console.log(selectedSort);
        // TODO: Use URLSearchParams here
        link = `${backendUrl}/pairs?export_format=${selectedFormat}&sort=${selectedSort}&direction=desc&chain_slugs=${chain_slug}&exchange_slugs=${exchange_slug}&filter=${selectedFilter}`;
    }
</script>

<h1 data-test-id="title">Export trading pair data for {exchange_name}</h1>

<p>Download data as Microsoft Excel file for analysis.</p>

<form class="form-export">

    <div class="form-group">

        {#if exchange_slug}
          <div class="form-group">
            <label for="exampleFormControlInput1">Selected exchange</label>
            <input type="text" class="form-control" id="exampleFormControlInput1" disabled value={exchange_name}>
          </div>
        {/if}

        <label for="export_format">Export format</label>
        <select class="form-control" id="export_format" bind:value={selectedFormat}>
            <option value="excel">Microsoft Excel .xlsx</option>
        </select>

        <label for="export_dataset">Dataset</label>
        <select class="form-control" id="export_dataset" bind:value={selectedDataset}>
            <option value="top_3000_rows">Top 3000 pairs</option>
        </select>

        <label for="export_dataset">Sorted by</label>
        <select class="form-control" id="sorted_by" bind:value={selectedSort}>
            <option value="liquidity_change_24h">Liquidity change 24h</option>
            <option value="usd_liquidity_latest">Liquidity available latest</option>
            <option value="usd_volume_24h">Volume 24h</option>
            <option value="price_change_24h">Price change 24h</option>
        </select>

        <label for="export_dataset">Filter</label>
        <select class="form-control" id="filter" bind:value={selectedFilter}>
            <option value="unfiltered">Unfiltered</option>
            <option value="min_liquidity_100k">Min. liquidity $100k</option>
            <option value="min_liquidity_1M">Min. liquidity $1M</option>
        </select>
    </div>

    <a class="btn btn-primary" href={link} download on:click={handleDownloadClick} disabled={downloadDisabled}>Download trading pair data</a>

</form>

<div class="foot-note">
    <p>
        Exported data is useful e.g. for analysis of new tokens entering the market.
    </p>

    <p>
        This data export contains only data for <a class="body-link" href="/trading-view/{chain_slug}/{exchange_slug}">{exchange_name}</a>.
        Read <a class="body-link" rel="external" href="https://https://tradingstrategy.ai/api/explorer/">column format documentation in PairSummary section of the API documentation.</a>
        For all datasets, see <a class="body-link" href="/trading-view/backtesting">Backtesting</a> page.
    </p>
</div>

<style>
    .form-export {
        max-width: 600px;
    }

    select {
        -webkit-appearance: none;
        -moz-appearance: none;
    }

    .foot-note {
        margin-top: 60px;
    }
</style>