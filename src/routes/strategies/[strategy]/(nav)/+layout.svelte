<script lang="ts">
	import { page } from '$app/stores';
	import { AlertItem, AlertList, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';
	import { getTradeExecutorErrorHtml } from 'trade-executor-frontend/strategy/error';

	export let data;

	$: ({ summary } = data);

	$: backtestAvailable = summary.backtest_available;
	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(summary);

    console.log(data);
</script>

<main class="strategy-layout ds-container">
	<PageHeading>
		<h1>{summary.name}</h1>
		<p>{summary.long_description}</p>

		{#if errorHtml}
			<div class="error-wrapper">
				<AlertList status="warning" size="sm">
					<AlertItem title="Ongoing execution issues">
						{@html errorHtml}
					</AlertItem>
				</AlertList>
			</div>
		{/if}
	</PageHeading>

	<div class="subpage">
		<StrategyNav
			strategyId={summary.id}
			portfolio={data.state.portfolio}
            onChainData={summary.on_chain_data}
			currentPath={$page.url.pathname}
			{backtestAvailable}
		/>
		<div>
			<slot />
			<p class="beta-notice">
				<strong>Beta notice</strong>: Trade execution is currently in beta. Execution may contain issues.
			</p>
		</div>
	</div>
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
		margin: var(--space-xl) 0;
		color: hsla(var(--hsl-text-extra-light));
	}

	.error-wrapper {
		margin-top: var(--space-md);
	}
</style>
