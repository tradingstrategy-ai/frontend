<!--
	Page to display the latest strategy thinking chart.

	TODO: Image URLs/SVG rendering are not final. SVG images will
	be replacead with Plotly JS charts and this is only MVP.
-->
<script lang="ts">
	import { Alert } from '$lib/components';

	export let data;
	$: ({ imageUrls, strategy } = data);

	let hasError = false;
	let errorUrl = '';

	function handleError(this: HTMLImageElement) {
		errorUrl = this.src;
		hasError = true;
	}
</script>

<svelte:head>
	<title>Decision making | {strategy.name} | Trading Strategy</title>
	<meta
		name="description"
		content="The technical indicators and strategy decision making process for the last decision making cycle of {strategy.name} strategy"
	/>
</svelte:head>

<section class="decision-making" class:hasError>
	<h4>The technical indicators and strategy decision making process for the last decision making cycle.</h4>

	{#if hasError}
		<Alert status="warning" size="md">
			Could not load strategy decision making data. If the trade executor instance has been restarted recently, this
			data may not be available until the first strategy decision making cycle is completed. The URL is:<br />
			<a target="_blank" href={errorUrl}>{errorUrl}</a>
		</Alert>
	{/if}

	{#if !hasError}
		<div class="images">
			<img class="light" src={imageUrls.light} alt="Strategy decision data (light)" on:error={handleError} />
			<img class="dark" src={imageUrls.dark} alt="Strategy decision data (dark)" on:error={handleError} />
		</div>
	{/if}
</section>

<style>
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
		}

		.light {
			display: var(--cm-dark, none);
		}

		.dark {
			display: var(--cm-light, none);
		}
	}
</style>
