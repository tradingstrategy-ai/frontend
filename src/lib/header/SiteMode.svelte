<script context="module">
    /**
     * A helpful widget to identify non-production deployment and give some developer diagnostics.
     */
    import { siteMode, backendUrl } from '$lib/config';

    const siteBar = siteMode == 'local' || siteMode == 'staging';

</script>

{#if siteBar}
    <div class="site-mode text-center">
        Frontend running in <strong>{siteMode}</strong> mode, backend is <strong>{backendUrl}</strong>.
    </div>
{/if}

<style>
    .site-mode {
        padding: 10px;
        background: blue;
        color: white;
    }
</style>