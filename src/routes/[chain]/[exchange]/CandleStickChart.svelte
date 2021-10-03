<script>

    import Skeleton from '$lib/Skeleton.svelte';
    import { browser } from '$app/env';

    export let candles;
</script>


<div class="candle-stick-chart">
    {#if candles}
    {:else}
        <Skeleton />
    {/if}
</div>