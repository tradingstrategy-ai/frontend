<script lang="ts">
	import type {TradingPosition} from "trade-executor-frontend/state/interface";
    import type {PositionFlagMap} from "./position-flags";
    import Tooltip from "$lib/components/Tooltip.svelte";

    // input as getPositionFlags(position)
    export let flags: PositionFlagMap;

</script>

<div class="flags">
    {#each [...flags] as [key, flag]}
        <Tooltip>
            <span slot="tooltip-trigger">
                {flag.abbreviation}
            </span>

            <div slot="tooltip-popup">
                Hello there
            </div>
        </Tooltip>
    {/each}
</div>


<style>
    .flags {
        white-space: nowrap;
    }
</style>