<!--

    Page to display the latest strategy thinking chart.

-->
<script lang="ts">
	import type { PageData } from './$types';
    import warning from '$lib/assets/icons/warning.svg';
	import {writable} from "svelte/store";
	import {AlertItem, AlertList} from "$lib/components/index.js";

	export let data: PageData;

	const errored = writable(false);

	// The URLs for strategy thinking images
	$: imageUrls = data.imageUrls;

	// https://stackoverflow.com/questions/69020710/fall-back-image-with-sveltekit
    const fallback = warning;
    const handleError = ev => {
        ev.target.src = fallback;
        errored.set(true);
    }
</script>

{#if errored}
	<AlertList status="warning">
		<AlertItem>
			Could not load strategy decision making data. If the trade executor instance has been
            restarted recently, this data may not be available until the first strategy decision
            making cycle is completed.
		</AlertItem>
	</AlertList>
{/if}

<img class="light" src={imageUrls.light} on:error={handleError}>

<style>
	img {
		margin: 20px 0;
	}
</style>