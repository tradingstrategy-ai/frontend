<!--
A test endpoint for the page load progress bar. Page load is delayed 2 seconds
by default. Increment the `?page=n` param to delay by n * 2 seconds.
-->
<script lang="ts">
	import { Button, Section } from '$lib/components';

	export let data;
	$: page = data.page;
	$: nextPage = page + 1;
</script>

<svelte:head>
	<title>Developer diagnostics page</title>
	<meta name="description" content="Information about the currently running frontend version" />
</svelte:head>

<main class="slow-load">
	<Section padding="sm" gap="sm">
		<h2>You're on Page {page}</h2>

		<p>
			In this page's <code>load</code> function, we waited for {page * 2} seconds to mimick a real-world API call before
			rendering. You can go back to the home page, which should load instantaneously because it doesn't do much server side.
			Page {nextPage} will have a longer delay of {nextPage * 2} seconds.
		</p>

		<div class="ctas">
			<Button label="Home" href="/" />
			<Button secondary label="Page {nextPage}" href="?page={nextPage}" />
		</div>
	</Section>
</main>

<style>
	.ctas {
		display: flex;
		gap: var(--space-md);

		@media (--viewport-xs) {
			flex-direction: column;
		}

		:global(.button) {
			min-width: 10rem;
		}
	}
</style>
