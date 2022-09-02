<!--
	Handle maintenance plus chain specific errors.
	Often blockchain data is bad and we want to drop users away from the page. See:
	https://kit.svelte.dev/docs/layouts#error-pages
-->
<script context="module">
	export function load({ error, status }) {
		console.error('Ooops, reached trading data error handle, error is', error);
		const maintenance = error.name === 'ChainInMaintenance';
		return {
			props: {
				title: `${status}`,
				message: error.message,
				maintenance: maintenance,
				chainName: error.chainName
			}
		};
	}
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	export let title: string;
	export let message: string;
	export let maintenance: boolean;
	export let chainName: string;
</script>

<svelte:head>
	<title>Error: {title}</title>
</svelte:head>

<section class="ds-container">
	{#if maintenance}
		<h1 class="text-center">{chainName} data under maintenance</h1>

		<p class="text-center">
			We cannot currently display this page, because there is temporary maintenance ongoing related to {chainName} blockchain.
			Data will be back soon.
		</p>
	{:else}
		<h1 class="text-center">HTTP {title} error</h1>

		<pre>{message}</pre>
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
