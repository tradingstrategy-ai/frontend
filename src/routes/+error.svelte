<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Logo } from '$lib/components';
	import MaintenanceNotice from './MaintenanceNotice.svelte';
	import ErrorPageInfo from './ErrorPageInfo.svelte';
	import IconConsole from '~icons/local/console';

	let showLogs = false;

	$: status = $page.status;
	$: chainName = $page.error?.chainName;
	$: stack = $page.error?.stack;
</script>

<svelte:head>
	<title>Error: {$page.status}</title>
</svelte:head>

<main class="error-page">
	<header>
		<a href="/" rel="homepage">
			<Logo />
		</a>
	</header>

	<div class="inner">
		<MaintenanceNotice --section-max-width="48rem" --section-padding="0" />

		{#if status < 500}
			<ErrorPageInfo {status} title={$page.error?.message || 'Client request error'}>
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
		{:else if status === 503}
			<ErrorPageInfo {status} title={'Service is unavailable'}>
				{#if stack}
					<Button on:click={() => (showLogs = !showLogs)}>
						<IconConsole slot="icon" />
						{showLogs ? 'Hide logs' : 'Show logs'}
					</Button>
				{/if}
			</ErrorPageInfo>
		{:else}
			<ErrorPageInfo
				{status}
				title={$page.error?.message ?? 'Internal Error'}
				details={$page.error?.eventId ? `Event ID: ${$page.error.eventId}` : ''}
			/>
		{/if}
	</div>

	<aside class="ds-container">
		{#if stack && showLogs}
			<pre class="terminal-viewport">{stack.join('\n')}</pre>
		{/if}
	</aside>
</main>

<style>
	.error-page {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		min-height: 100vh;
		background: var(--c-body);
		display: grid;
		grid-template-rows: 1fr auto 1fr;
		gap: var(--space-4xl);
		--container-max-width: 1020px;

		.inner {
			display: grid;
		}

		header {
			display: grid;
			place-content: end center;
			--logo-height: 4rem;

			@media (--viewport-sm-down) {
				--logo-height: 3rem;
			}
		}

		aside {
			grid-row: 3 / 4;
			align-items: start;
		}

		pre {
			white-space: pre-wrap;
			overflow-wrap: break-word;
			max-height: 10rem;
		}
	}
</style>
