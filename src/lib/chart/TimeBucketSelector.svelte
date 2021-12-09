<script context="module" lang="ts">

    const validBuckets = ["1m", "5m", "15m", "1h", "4h", "1d", "7d", "30d"];


    /**
     * Figure out from the URL fragment which time bucket to choose
     */
    export function fromHashToTimeBucket(hash: string): string {
        if(hash) {

            if(!hash.startsWith("#")) {
                throw new Error(`Does not look like a hash ${hash}`);
            }

            const b = hash.substring(1).toLowerCase();
            if(validBuckets.includes(b)) {
                return b;
            }
        }
        return "4h";
    }
</script>


<script lang="ts">
    export let activeBucket = null;

    function onBucketClick(bucket) {
        window.location.hash = bucket;
        // Strip leading #
        activeBucket = fromHashToTimeBucket('#' + bucket);
    }

</script>


<div class="time-bucket-selector">
    <span>Candle time frame: </span>
    {#each validBuckets as bucket}
        <a href={'#' + bucket} class={bucket === activeBucket ? "active" : ""} on:click|preventDefault={() => onBucketClick(bucket)}>
            {bucket}
        </a>
    {/each}
</div>

<style>

    a {
        font-weight: normal;
        border-bottom: 1px dotted black;
        margin-left: 10px;
        display: inline-block;
        min-width: 30px; /* Needed because bold text */
        text-align: center;
    }

    .active {
        font-weight: bold;
        border-bottom: 1px solid black;
    }
</style>