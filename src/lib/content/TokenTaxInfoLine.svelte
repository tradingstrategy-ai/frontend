<!--
@component

Present token tax in the user interface as buy tax / transfer tax / sell tax tuple.
Links to the documentation.

Values for error code:

    lack_of_liquidity = 999
    contract_logic_failed = 998
    router_info_missing = 997
    transfer_from_failed = 996
    out_of_gas_during_transfer = 995
    sell_failed = 994
    out_of_gas_during_sell = 993
    approval_failure = 992
    unsupported_quote_token = 991

-->

<script lang="ts">
    import type {TokenTax} from "../helpers/tokentax";
    import {formatTokenTaxPercent} from "../helpers/tokentax";

    // Trading pair details as received from
    // /pair-details endpoint
    export let tokenTax: TokenTax;

    // Present tex in long format
    export let longFormat = false;

</script>

<a rel="external"
   href="https://tradingstrategy.ai/docs/programming/token-tax.html"
   class="token-tax body-link">

    {#if tokenTax.liquidityIssue}
        {#if longFormat}
            Not available (no trading liquidity to measure tax).
        {:else}
            N/A (no liquidity)
        {/if}
    {:else if tokenTax.measurementIssue}
        Token not tradeable
    {:else if tokenTax.maxTax > 0 }
        { formatTokenTaxPercent(tokenTax.buyTax) } / { formatTokenTaxPercent(tokenTax.transferTax) } / { formatTokenTaxPercent(tokenTax.sellTax) }
    {:else}
        No transfer fees
    {/if}
</a>
