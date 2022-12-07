<!--

    Page to display the latest strategy thinking chart.

    TODO: Image URLs/SVG rendering are not final. SVG images will
    be replacead with Plotly JS charts and this is only MVP.

-->
<script lang="ts">
	import type { PageData } from './$types';
	import warning from '$lib/assets/icons/warning.svg';
	import { AlertItem, AlertList } from '$lib/components/index.js';

	export let data: PageData;

	let errored = false;
	let errorUrl = '';

	// The URLs for strategy thinking images
	$: imageUrls = data.imageUrls;

	// https://stackoverflow.com/questions/69020710/fall-back-image-with-sveltekit
	const fallback = warning;
	function handleError(ev: Event) {
		const target = ev.target as HTMLImageElement;
		errorUrl = target.src;
		errored = true;
		target.src = fallback;
	}
</script>

<AlertList status="warning">
	<AlertItem displayWhen={errored}>
		Could not load strategy decision making data. If the trade executor instance has been restarted recently, this data
		may not be available until the first strategy decision making cycle is completed. The URL is
		<strong>{errorUrl}.</strong>
	</AlertItem>
</AlertList>

<img class="light" src={imageUrls.light} alt="Strategy decision data (light)" on:error={handleError} />
<img class="dark" src={imageUrls.dark} alt="Strategy decision data (dark)" on:error={handleError} />

<style>
	img {
		margin: 1.5rem 0;
		width: 100%;
	}

	.light {
		display: var(--cm-dark, none);
	}

	.dark {
		display: var(--cm-light, none);
	}
</style>
