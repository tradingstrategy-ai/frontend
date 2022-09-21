<!--
	Handle maintenance plus chain specific errors.
	Often blockchain data is bad and we want to drop users away from the page.
-->
<script lang="ts">
	import { chainsUnderMaintenance } from '$lib/config';
	import { page } from '$app/stores';
	import { Button } from '$lib/components';

	let status: number;
	let message: string;
	let isMaintenanceError: boolean;
	let chainName: string | undefined;

	// NOTE: SvelteKit bug? $page.status does not match $page.error.status when navigating to
	// an error page via internal routing. Using $page.error.status instead of $page.status for now.
	$: {
		({ status, message } = $page.error);
		isMaintenanceError = status === 503 && /maintenance/i.test(message);
		chainName = chainsUnderMaintenance[$page.params.chain];
	}
</script>

<svelte:head>
	<title>Error: {status}</title>
</svelte:head>

<section class="ds-container">
	{#if isMaintenanceError}
		<h1 class="text-center">{chainName} data under maintenance</h1>

		<p class="text-center">
			This page is temporarily unavailable due to maintenance related to {chainName} blockchain. Data will be back soon.
		</p>
	{:else}
		<h1 class="text-center">HTTP {status} error</h1>

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
