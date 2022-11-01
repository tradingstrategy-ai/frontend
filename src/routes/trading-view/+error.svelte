<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components';

	$: chainName = $page.error.chainName;
</script>

<svelte:head>
	<title>Error: {$page.status}</title>
</svelte:head>

<section class="ds-container">
	{#if chainName}
		<h1 class="text-center">{chainName} data under maintenance</h1>

		<p class="text-center">
			{$page.error.message}
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
