<!--
	Page to display Enzyme vault information.
-->
<script lang="ts">
  import {formatDaysAgo, formatDollar, formatDuration, formatPercent} from '$lib/helpers/formatters';
  import {DataBox, SummaryBox} from "$lib/components";

  export let data;

</script>

<section class="vault">
    <SummaryBox title="Vault information">
        <div class="vault-info">
            <DataBox size="sm" label="Vault type">
                <p>Enzyme</p>
            </DataBox>

            <DataBox size="sm" label="Blockchain">
                <p>Polygon</p>
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
</style>
