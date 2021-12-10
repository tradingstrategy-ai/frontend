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

    <p class="lead">
        <span class="pulse"></span>
        Current <a href="/trading-view">market feeds</a> include
        <a href="/trading-view/blockchains"><strong>{numbers.blockchains}</strong> blockchains</a>,
        <a href="/trading-view/exchanges"><strong>{formatAmount(numbers.exchanges)}</strong> decentralised exchanges</a> with
        <a href="/trading-view/trading-pairs"><strong>{formatAmount(numbers.pairs)}</strong> trading pairs</a> and
        <strong>{formatAmount(numbers.tokens)}</strong> tokens.
        Utilise <a href="/trading-view"><strong>{formatSizeGigabytes(numbers.database_size)} GB</strong> market data</a>
        to trade systematically.
    </p>
</div>

<style>

    a {
        border-bottom: 2px solid var(--link-underline);
    }

    .lead {
        margin-top: 2rem;
    }

    .impressive-numbers {
    }

	.pulse {
	  display: inline-block;
	  width: 16px;
	  height: 16px;
	  border-radius: 50%;
	  background: var(--price-up-green);
	  cursor: pointer;
	  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
	  animation: pulse 2s infinite;
	}

	@keyframes pulse {
	  0% {box-shadow: 0 0 0 0 rgba(219, 0, 0, 0.4);
       /* box-shadow: 0 0 0 0 var(--price-up-green); */
	  }
	  70% {
		  box-shadow: 0 0 0 10px rgba(219, 0, 0, 0);
	  }
	  100% {
		  -moz-box-shadow: 0 0 0 0 rgba(219, 0, 0, 0);
	  }
	}
</style>