<script>
    /**
     * Frontpage impressive numbers widget.
     *
     * For the API see impressive-numbers here https://tradingstrategy.ai/api/explorer/
     */
    import {formatAmount, formatSizeGigabytes} from "$lib/helpers/formatters";

    // Might be null if API
    export let numbers;

</script>

<div class="impressive-numbers">
    <h3>Trading Strategy network status</h3>

    <p class="lead">
        <span class="pulse"></span>
        Currently running <strong>{numbers.oracles}</strong> oracle nodes,
        connected to <a href="/trading-view/blockchains"><strong>{numbers.blockchains}</strong> blockchains</a>,
        <a href="/trading-view/exchanges"><strong>{formatAmount(numbers.exchanges)}</strong> decentralised exchanges</a> with
        <a href="/trading-view/trading-pairs"><strong>{formatAmount(numbers.pairs)}</strong> trading pairs</a> and
        <strong>{formatAmount(numbers.tokens)}</strong> tokens.
        Automated trading strategies make decisions based on <a href="/trading-view"><strong>{formatSizeGigabytes(numbers.database_size)} GB</strong> market data</a>.
        The protocol is beta version and under active development.
    </p>
</div>

<style>

    a {
        border-bottom: 1px solid black;
    }

    .impressive-numbers {
    }
</style>