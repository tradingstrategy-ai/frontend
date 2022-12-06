<!--

    Page to display the latest strategy thinking chart.

    TODO: Image URLs/SVG rendering are not final. SVG images will
    be replacead with Plotly JS charts and this is only MVP.

-->
<script lang="ts">
	import type { PageData } from './$types';
	import warning from '$lib/assets/icons/warning.svg';
	import { writable } from 'svelte/store';
	import { AlertItem, AlertList } from '$lib/components/index.js';

	export let data: PageData;

	const errored = writable(false);
	const errorUrl = writable('');

	// The URLs for strategy thinking images
	$: imageUrls = data.imageUrls;

	// https://stackoverflow.com/questions/69020710/fall-back-image-with-sveltekit
	const fallback = warning;
	const handleError = (ev) => {
		ev.target.src = fallback;
		errorUrl.set(ev.srcElement.src);
		errored.set(true);
	};
</script>

{#if $errored}
	<AlertList status="warning">
		<AlertItem>
			Could not load strategy decision making data. If the trade executor instance has been restarted recently, this
			data may not be available until the first strategy decision making cycle is completed. The URL is <b
				>{$errorUrl}.</b
			>
		</AlertItem>
	</AlertList>
{/if}

<img class="light" src={imageUrls.light} on:error={handleError} />
<img class="dark" src={imageUrls.dark} on:error={handleError} />

<style>
	img {
		margin: 20px 0;
		width: 100%;
	}

	.light {
		display: var(--cm-dark, none);
	}

	.dark {
		display: var(--cm-light, none);
	}
</style>
