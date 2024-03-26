<!--
	Page to display the latest strategy thinking chart.

	TODO: Image URLs/SVG rendering are not final. SVG images will
	be replacead with Plotly JS charts and this is only MVP.
-->
<script lang="ts">
	import warning from '$lib/assets/icons/warning.svg';
	import { Alert } from '$lib/components';

	export let data;

	// The URLs for strategy thinking images
	$: imageUrls = data.imageUrls;

	let hasError = false;
	let errorUrl = '';

	// https://stackoverflow.com/questions/69020710/fall-back-image-with-sveltekit
	const fallback = warning;
	function handleError(ev: Event) {
		const target = ev.target as HTMLImageElement;
		errorUrl = target.src;
		hasError = true;
		target.src = fallback;
	}
</script>

<section class="decision-making" class:hasError>
	<h4>The technical indicators and strategy decision making process for the last decision making cycle.</h4>

	{#if hasError}
		<Alert status="warning" size="md">
			Could not load strategy decision making data. If the trade executor instance has been restarted recently, this
			data may not be available until the first strategy decision making cycle is completed. The URL is:<br />
			<a target="_blank" href={errorUrl}>{errorUrl}</a>
		</Alert>
	{/if}

	<div class="images">
		<img class="light" src={imageUrls.light} alt="Strategy decision data (light)" on:error={handleError} />
		<img class="dark" src={imageUrls.dark} alt="Strategy decision data (dark)" on:error={handleError} />
	</div>
</section>

<style lang="postcss">
	.decision-making {
		display: grid;
		gap: 1.25rem;

		h4 {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md, normal);
			color: var(--c-text-extra-light);
		}

		:global(.alert-item a) {
			overflow-wrap: anywhere;
		}
	}

	.images {
		text-align: center;

		img {
			width: 100%;

			.hasError & {
				max-width: 20rem;
			}
		}

		.light {
			display: var(--cm-dark, none);
		}

		.dark {
			display: var(--cm-light, none);
		}
	}
</style>
