<!--

    Handle maintenance plus chain specific errors.

    Often blockchain data is bad and we want to drop users away from the page.


    For more information see

    - https://kit.svelte.dev/docs/layouts#error-pages

-->
<script context="module">
	import { ChainInMaintenance } from '$lib/chain/maintenance';

	/** @type {import('@sveltejs/kit').Load} */
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

<script>
	export let title;
	export let message;
	export let maintenance;
	export let chainName;
</script>

<svelte:head>
	<title>Error: {title}</title>
</svelte:head>

<div class="container">
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

	<p class="text-center">
		<a class="btn btn-primary" href="/">Continue to Trading Strategy front page</a>
	</p>

	<p class="text-center">
		<a class="body-link" href="https://discord.gg/en8tW6MDtw">Join Discord discussion for more information</a>
	</p>
</div>

<style>
	.btn {
		margin: 60px 0;
	}

	pre {
		margin: 20px;
		padding: 20px;
		border: 1px solid #888;
		background: white;
	}

	/* Readbility */
	.text-center {
		margin: 0 auto;
		max-width: 600px;
	}
</style>
