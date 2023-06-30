<script lang="ts">
	import { page } from '$app/stores';
	import { AlertItem, AlertList, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';
	import { getTradeExecutorErrorHtml } from 'trade-executor-frontend/strategy/error';

	export let data;

	$: summary = data.summary;

	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(summary);
</script>

<main class="strategy-layout ds-container">
	<PageHeading>
		<h1>{summary.name}</h1>
		<p>{summary.long_description}</p>

		{#if errorHtml}
			<div class="error-wrapper">
				<AlertList status="warning" size="sm">
					<AlertItem title="On-going execution issues">
						{@html errorHtml}
					</AlertItem>
				</AlertList>
			</div>
		{/if}
	</PageHeading>

	<div class="subpage">
		<StrategyNav strategyId={summary.id} portfolio={data.state.portfolio} currentPath={$page.url.pathname} />
		<slot />
	</div>

	<p class="beta-notice">
		<strong>Beta notice</strong>: Trade execution is currently in beta. Execution may contain issues.
	</p>
</main>

<style lang="postcss">
	.strategy-layout {
		display: grid;
		gap: var(--space-md);

		& :global(> .alert-list) {
			width: 100%;
			margin-top: var(--space-lg);
		}

		& .page-heading p {
			font: var(--f-ui-md-medium);
		}

		& .subpage :global {
			display: grid;
			gap: var(--space-ls);

			@media (--viewport-lg-up) {
				gap: var(--space-5xl);
				grid-template-columns: 14rem auto;
			}
		}
	}

	.beta-notice {
		text-align: center;
		color: #888;
	}

	.error-wrapper {
		margin: 1em 0;
	}
</style>
