<!--
@compontent

Trading pair API examples

Add inline curl examples to the trading pair page.
-->

<script lang="ts">

    // Pair details
    export let details;

    // Pair summary info
    export let summary;

    $: pairInfoUrl = `https://tradingstrategy.ai/api/pair-details?exchange_slug=${summary.exchange_slug}&chain_slug=${summary.chain_slug}&pair_slug=${summary.pair_slug}`;
    $: candlesUrl = `https://tradingstrategy.ai/api/candles?pair_id=${summary.pair_id}&time_bucket=1d`;
</script>

<h2>Trading pair info</h2>

<p>
    Get trading pair overview as JSON over HTTP GET.
</p>

<pre>curl "{pairInfoUrl}"</pre>

<a class="body-link" href={pairInfoUrl}>
    Click here to test.
</a>

<h2>Daily OHLCV data</h2>

<p>
    Download daily <a class="body-link" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">OHLCV</a> candles as JSON over HTTP GET.
</p>

<pre>curl "{candlesUrl}"</pre>

<a class="body-link" href={candlesUrl}>
    Click here to test.
</a>

<h2>Backtesting datasets</h2>

<p>
    Backtesting datasets are available as a separate download.
    The datasets include <strong>{summary.pair_symbol}</strong> data.
    View <a class="body-link" href="/trading-view/backtesting">backtesting datasets</a>.
</p>


<style>

    h2 {
        margin: 2rem 0;
    }

    pre {
        background: white;
        padding: 1rem;
    }

</style>
