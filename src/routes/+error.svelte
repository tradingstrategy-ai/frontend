<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Logo } from '$lib/components';
	import ErrorPageInfo from './ErrorPageInfo.svelte';

	let showLogs = false;

	$: status = $page.status;
	$: chainName = $page.error?.chainName;
	$: stack = $page.error?.stack;
</script>

<svelte:head>
	<title>Error: {$page.status}</title>
</svelte:head>

<main>
	<header>
		<a href="/" rel="homepage">
			<Logo />
		</a>
	</header>

	{#if status === 404}
		<ErrorPageInfo {status} title="Page not found">
			<Button label="Go to home page" href="/" />
		</ErrorPageInfo>
	{:else if status === 503 && chainName}
		<ErrorPageInfo
			{status}
			title="{chainName} data under maintenance"
			details="This page is temporarily unavailable due to maintenance related to {chainName} blockchain. Data will be back soon."
		>
			<Button label="Explore DEX data" href="/trading-view" />
		</ErrorPageInfo>
	{:else}
		<ErrorPageInfo {status} title={status === 503 ? 'Service is unavailable' : $page.error.message}>
			{#if stack}
				<Button icon="console" on:click={() => (showLogs = !showLogs)}>
					{showLogs ? 'Hide logs' : 'Show logs'}
				</Button>
			{/if}
		</ErrorPageInfo>
	{/if}

	<aside class="ds-container">
		{#if stack && showLogs}
			<pre>{stack.join('\n')}</pre>
		{/if}
	</aside>
</main>

<style lang="postcss">
	header {
		display: grid;
		place-content: end center;
		--logo-height: 4rem;

		@media (--viewport-sm-down) {
			--logo-height: 3rem;
		}
	}

	main {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--c-body-v1);
		display: grid;
		grid-template-rows: 1fr auto 1fr;
		gap: 2.75rem;
		--container-max-width: 1020px;
	}

	aside {
		grid-row: 3 / 4;
		align-items: start;
	}

	pre {
		padding: 1.5rem;
		background: var(--c-background-7-v1);
		border: 2px solid var(--c-border-1-v1);
		border-radius: 0.375rem;
		color: var(--c-parchment);
		white-space: pre-wrap;
		overflow-wrap: break-word;
		max-height: 10rem;
	}
</style>
