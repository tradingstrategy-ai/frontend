<script lang="ts">
    /**
     * The main website layout frame.
     */
    import { fade } from 'svelte/transition';
	import Navbar from '$lib/header/Navbar.svelte';
	import AppHead from '$lib/header/AppHead.svelte';
    import SiteMode from "$lib/header/SiteMode.svelte";
    import PageLoadProgressBar from "$lib/header/PageLoadProgressBar.svelte";
    import navigationState from '../stores/navigation';

	import '../../theme/dist/css/neumorphism.css';
</script>

<svelte:window
	on:sveltekit:navigation-start={() => {
		$navigationState = 'loading';
	}}
	on:sveltekit:navigation-end={() => {
		$navigationState = 'loaded';
	}}
/>


<AppHead />

    {#if $navigationState === 'loading'}
        <div out:fade={{ delay: 500 }}>
            <PageLoadProgressBar />
        </div>
    {/if}

<Navbar />
<slot />
<SiteMode />

<style>
    .site-alert {
        padding: 10px;
        background: red;
        color: white;
    }

    :global(:root) {
	    --price-up-green: #458b00;
	    --price-down-red: #cc0000;
        --link-underline: #458b00;
    }
</style>
