<!--
	Page to display the strategy backtest results.
-->
<script lang="ts">

	import {wallet} from "$lib/wallet";
    import connectWizard from "wizard/connect-wallet/store";
    import depositWizard from "wizard/deposit/store";
    import redeemWizard from "wizard/redeem/store";
    import {Button, SummaryBox} from "$lib/components";

    export let data;

</script>

<section class="backtest">
    <SummaryBox title="Backtest data" ctaPosition="top">
        <div class="content">
            View the backtest results below or downlaod the notebook used to test the strategy.
        </div>
        <div class="actions">
            <Button label="Download notebook"  />
            <!-- TODO: The webhook endpoint missing -->
            <Button label="Download raw backtest data" disabled />
        </div>
    </SummaryBox>

</section>

<style>
	.performance {
		display: grid;
		gap: var(--space-lg);
	}
</style>
