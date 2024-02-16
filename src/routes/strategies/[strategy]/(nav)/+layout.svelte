<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, DataBadge, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';
	import { WalletWidget } from '$lib/wallet';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let data;
	$: ({ chain, strategy, state } = data);

	$: backtestAvailable = strategy.backtest_available;
	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(strategy);
</script>

<main class="strategy-layout ds-container">
	<PageHeading description={strategy.short_description}>
		<img slot="icon" src={strategy.icon_url} alt={strategy.name} />
		<div class="title" slot="title">
			{strategy.name}
			<span class="beta-badge">
				<DataBadge status="warning">Beta</DataBadge>
			</span>
		</div>
		<div class="wallet-widget" slot="cta">
			<WalletWidget {strategy} {chain} />
		</div>
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
			strategyId={strategy.id}
			portfolio={state.portfolio}
			onChainData={strategy.on_chain_data}
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

		.beta-badge {
			display: inline-block;
			font-family: var(--ff-ui);
			font-size: clamp(11px, 0.45em, 16px);
			line-height: var(--lh-ui);
			transform: translate(0.25em, -0.375em);
		}

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

	.wallet-widget {
		@media (--viewport-sm-down) {
			display: none;
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
