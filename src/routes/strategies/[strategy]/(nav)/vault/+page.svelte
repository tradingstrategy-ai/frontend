<!--
	Page to display Enzyme vault information.
-->
<script lang="ts">
  import {formatDaysAgo, formatDollar, formatDuration, formatPercent} from '$lib/helpers/formatters';
  import {Button, DataBox, SummaryBox} from "$lib/components";
  import type {OnChainData} from "trade-executor-frontend/strategy/runtimeState";
  import connectWizard from "wizard/connect-wallet/store";
  import {wallet} from "$lib/wallet";
  import depositWizard from "wizard/deposit/store";
  import redeemWizard from "wizard/redeem/store";

  export let data;
  export let onChainData: OnChainData = data.onChainData;

  const address = onChainData?.smart_contracts?.vault;

</script>

<section class="vault">
    <SummaryBox title="Vault information">

        <div class="actions">
            <Button label="View on Enzyme"  />
            <Button label="View on Polygonscan"  />
        </div>

        <div class="vault-info">
            <DataBox size="sm" label="Vault type">
                <p>Enzyme</p>
            </DataBox>

            <DataBox size="sm" label="Blockchain">
                <p>Polygon</p>
            </DataBox>

            <DataBox size="sm" label="Address">
                <!-- TODO: add more chains -->
                <a href={`https://polygoscan.com/address/${address}`}>
                    {address}
                </a>
            </DataBox>

        </div>
    </SummaryBox>


</section>


<style lang="postcss">
	.vault-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: inherit;
	}

	.actions {
		display: grid;
		gap: var(--space-ml);
		grid-template-columns: repeat(3, 1fr);
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
