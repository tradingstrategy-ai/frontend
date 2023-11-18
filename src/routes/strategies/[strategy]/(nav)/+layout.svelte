<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let data;

	$: ({ summary } = data);

	$: backtestAvailable = summary.backtest_available;
	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(summary);
</script>

<main class="strategy-layout ds-container">
	<PageHeading title={summary.name} description={summary.long_description}>
		<img slot="icon" src={summary.icon_url} alt={summary.name} />
	</PageHeading>

	{#if errorHtml}
		<div class="error-wrapper">
			<Alert status="warning" size="sm" title="Ongoing execution issues">
				{@html errorHtml}
			</Alert>
		</div>
	{/if}

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

		:global(> .alert-list) {
			width: 100%;
			margin-top: var(--space-lg);
		}

		.subpage :global {
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
		color: hsl(var(--hsl-text-extra-light));
	}

	.error-wrapper {
		margin-top: calc(var(--space-md) * -1);
		margin-bottom: var(--space-md);
	}
</style>
