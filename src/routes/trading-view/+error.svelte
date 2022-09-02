<!--
	Handle maintenance plus chain specific errors.
	Often blockchain data is bad and we want to drop users away from the page.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';

	$: maintenance = $page.error.name === 'ChainInMaintenance';
</script>

<svelte:head>
	<title>Error: {$page.status}</title>
</svelte:head>

<section class="ds-container">
	{#if maintenance}
		<h1 class="text-center">{$page.error.chainName} data under maintenance</h1>

		<p class="text-center">
			This page is temporarily unavailable due to maintenance related to {$page.error.chainName} blockchain. Data will be
			back soon.
		</p>
	{:else}
		<h1 class="text-center">HTTP {$page.status} error</h1>

		<pre>{$page.error.message}</pre>
	{/if}

	<p class="cta">
		<Button label="Continue to home page" href="/" />
		<Button
			secondary
			label="Join Discord for more information"
			icon="discord"
			href="https://discord.gg/en8tW6MDtw"
			target="_blank"
		/>
	</p>

	<p class="text-center" />
</section>

<style>
	section {
		--container-max-width: 720px;
		gap: 4rem;
	}

	pre {
		padding: 1.25rem;
		border: 1px solid var(--c-border-1);
		background: var(--c-background-2);
		color: var(--c-text-1);
		white-space: pre-wrap;
	}

	.cta {
		display: grid;
		gap: 1rem;
		justify-content: center;
		text-align: center;
	}
</style>
